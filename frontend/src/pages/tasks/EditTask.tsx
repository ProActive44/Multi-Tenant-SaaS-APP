import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { taskApi } from '../../api/task.api';
import { usersApi } from '../../api/auth.api';
import { useAuth } from '../../auth/AuthContext';
import type { TaskPriority, TaskStatus } from '../../types/task';
import type { User } from '../../types/auth';

export const EditTask: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as TaskPriority,
        status: 'OPEN' as TaskStatus,
        dueDate: '',
        assigneeIds: [] as string[],
        createdById: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [taskResponse, usersResponse] = await Promise.all([
                    taskApi.getTaskById(id),
                    usersApi.getUsers(1, 100)
                ]);

                const task = taskResponse.data;
                setFormData({
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority,
                    status: task.status,
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                    assigneeIds: task.assignees.map(a => a.userId),
                    createdById: task.createdById,
                });
                setUsers(usersResponse.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load task data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const isAdmin = ['ORG_ADMIN', 'ORG_OWNER'].includes(currentUser?.role || '');
    const isCreator = currentUser?.id === formData.createdById;
    const isAssignee = formData.assigneeIds.includes(currentUser?.id || '');

    const canEditDetails = isAdmin || isCreator;
    const canUpdateStatus = isAdmin || isCreator || isAssignee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);
        setError('');

        try {
            const payload: any = {
                status: formData.status,
            };

            if (canEditDetails) {
                payload.title = formData.title;
                payload.description = formData.description;
                payload.priority = formData.priority;
                payload.dueDate = formData.dueDate;
                payload.assigneeIds = formData.assigneeIds;
            }

            await taskApi.updateTask(id, payload);
            navigate('/tasks');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update task');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAssignee = (userId: string) => {
        if (!canEditDetails) return;
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds.includes(userId)
                ? prev.assigneeIds.filter(id => id !== userId)
                : [...prev.assigneeIds, userId]
        }));
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this task?')) {
                                    taskApi.deleteTask(id!).then(() => navigate('/tasks'));
                                }
                            }}
                            disabled={!canEditDetails}
                            className={`text-red-600 hover:text-red-800 font-medium ${!canEditDetails && 'opacity-50 cursor-not-allowed'}`}
                        >
                            Delete Task
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                disabled={!canEditDetails}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                disabled={!canEditDetails}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                    disabled={!canUpdateStatus}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="REOPENED">Reopened</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                    disabled={!canEditDetails}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    disabled={!canEditDetails}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assignees</label>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 ${!canEditDetails ? 'bg-gray-50' : ''}`}>
                                {users.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleAssignee(user.id)}
                                        className={`flex items-center p-2 rounded-md transition-colors ${canEditDetails ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                                            } ${formData.assigneeIds.includes(user.id)
                                                ? 'bg-blue-50 border-blue-200'
                                                : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.assigneeIds.includes(user.id)}
                                            onChange={() => { }}
                                            disabled={!canEditDetails}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:text-gray-400"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/tasks')}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            {(canEditDetails || canUpdateStatus) && (
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};
