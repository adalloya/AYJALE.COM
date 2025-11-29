import { useData } from '../../context/DataContext';
import { Users, Briefcase, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const { users, jobs, applications } = useData();

    const stats = [
        { name: 'Total Usuarios', value: users.length, icon: Users, color: 'bg-blue-500' },
        { name: 'Total Vacantes', value: jobs.length, icon: Briefcase, color: 'bg-green-500' },
        { name: 'Total Postulaciones', value: applications.length, icon: FileText, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`rounded-md p-3 ${item.color}`}>
                                        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-slate-900">{item.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-slate-900">Usuarios Recientes</h3>
                </div>
                <ul className="divide-y divide-slate-200">
                    {users.slice(0, 5).map((user) => (
                        <li key={user.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary-600 truncate">{user.name}</p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                                        {user.role}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-slate-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
