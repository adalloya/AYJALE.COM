import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const CandidateDashboard = () => {
    const { user } = useAuth();
    const { applications, jobs } = useData();

    const myApplications = applications.filter(app => app.candidate_id === user.id);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Mis Postulaciones</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-slate-200">
                    {myApplications.map(app => {
                        const job = jobs.find(j => j.id === app.job_id);
                        return (
                            <li key={app.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-primary-600 truncate">{job?.title}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${app.status === 'applied' ? 'bg-green-100 text-green-800' :
                                                app.status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-slate-100 text-slate-800'}`}>
                                            {
                                                {
                                                    'applied': 'Postulado',
                                                    'reviewing': 'En Revisión',
                                                    'interviewing': 'Entrevista',
                                                    'offer': 'Oferta',
                                                    'hired': 'Contratado',
                                                    'rejected': 'Rechazado'
                                                }[app.status] || app.status
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-slate-500">
                                            Aplicado el: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Fecha desconocida'}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                    {myApplications.length === 0 && (
                        <li className="px-4 py-12 text-center text-slate-500">No has realizado ninguna postulación aún.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CandidateDashboard;
