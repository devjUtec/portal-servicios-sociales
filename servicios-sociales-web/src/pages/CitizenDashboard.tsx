import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, CreditCard, Activity, Calendar, LogOut, CheckCircle, Clock, FileText } from 'lucide-react';

const CitizenDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [affiliations, setAffiliations] = useState<any[]>([]);
    const [contributions, setContributions] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCitizenData = async () => {
            try {
                // Traemos TODA la información del ciudadano de forma paralela
                const [affRes, contRes] = await Promise.all([
                    api.get('/affiliation/me'),
                    api.get('/contribution/me')
                ]);
                
                // NOTA: Para registros médicos no creamos el endpoint /me. Vamos a usar /medical-record/citizen/...
                const recRes = await api.get(`/medical-record/citizen/${user?.id}`);

                setAffiliations(Array.isArray(affRes.data) ? affRes.data : (affRes.data ? [affRes.data] : []));
                setContributions(Array.isArray(contRes.data) ? contRes.data : (contRes.data ? [contRes.data] : []));
                setRecords(Array.isArray(recRes.data) ? recRes.data : (recRes.data ? [recRes.data] : []));
            } catch (err) {
                console.error('Error fetching citizen data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchCitizenData();
    }, [user?.id]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '1rem', color: '#1e293b' }}>
            <style>
                {`
                @media (max-width: 768px) {
                    .citizen-grid { grid-template-columns: 1fr !important; }
                    .header-container { flex-direction: column; gap: 1.5rem; text-align: center; }
                    .header-user { flex-direction: column; }
                    .citizen-padding { padding: 1rem !important; }
                    .logout-btn { width: 100%; justify-content: center; }
                }
                `}
            </style>
            
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header Bienvenido */}
                <div className="header-container citizen-padding" style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    backgroundColor: 'white', padding: '1.5rem 2rem', borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '2rem'
                }}>
                    <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', color: 'white', flexShrink: 0
                        }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                                Bienvenido, {user?.firstName} {user?.lastName}
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>Portal Oficial del Ciudadano</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => logout()} 
                        className="btn logout-btn" 
                        style={{ color: '#ef4444', gap: '0.5rem', border: '1px solid #fee2e2', background: 'white' }}
                    >
                        <LogOut size={18} /> Salir
                    </button>
                </div>

                <div className="citizen-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Tarjeta: Mis Datos */}
                    <div className="card" style={{ background: 'white', border: 'none', padding: '1.5rem', margin: 0 }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e293b' }}>
                            <Activity size={20} color="#3b82f6" /> Perfil del Ciudadano
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Correo</span>
                                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{user?.email}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>N° Afiliación</span>
                                <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.875rem' }}>{affiliations[0]?.affiliationNumber || 'Procesando...'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta: Estado de Salud (Última Consulta) */}
                    <div className="card" style={{ background: 'white', border: 'none', padding: '1.5rem', margin: 0 }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
                            <FileText size={20} color="#ef4444" /> Resumen Médico
                        </h2>
                        {records.length > 0 ? (
                            <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                <p style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Último Diagnóstico</p>
                                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>{records[0].diagnosis}</p>
                                <p style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '0.5rem' }}>Fecha: {new Date(records[0].visitDate).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem', margin: 0 }}>No se registran consultas médicas recientes.</p>
                        )}
                    </div>
                </div>

                {/* Historial de Cotizaciones */}
                <div className="card" style={{ background: 'white', border: 'none', marginTop: '2rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981' }}>
                         <Clock size={20} color="#10b981" /> Historial de Cotizaciones
                    </h2>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -1.5rem', padding: '0 1.5rem' }}>
                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Periodo</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Empresa</th>
                                    <th style={{ textAlign: 'right', padding: '1rem' }}>Sueldo</th>
                                    <th style={{ textAlign: 'right', padding: '1rem' }}>Aporte</th>
                                    <th style={{ textAlign: 'center', padding: '1rem' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contributions.map((cont, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>{cont.period}</td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{cont.employer}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#475569' }}>${parseFloat(cont.baseAmount).toFixed(2)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: '#166534' }}>${parseFloat(cont.contributionAmount).toFixed(2)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>PAGADO</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {contributions.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No se encontraron cotizaciones.</div>
                        )}
                    </div>
                </div>

                {/* Historial de Consultas Médicas */}
                <div className="card" style={{ background: 'white', border: 'none', marginTop: '2rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#3b82f6' }}>
                         <Activity size={20} color="#3b82f6" /> Consultas Médicas
                    </h2>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -1.5rem', padding: '0 1.5rem' }}>
                        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Fecha</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Médico</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Diagnóstico</th>
                                    <th style={{ textAlign: 'center', padding: '1rem' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((rec, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 600 }}>{new Date(rec.visitDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{rec.primaryDoctor}</td>
                                        <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 600 }}>{rec.diagnosis}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>{rec.status.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {records.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No registra expedientes médicos.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
