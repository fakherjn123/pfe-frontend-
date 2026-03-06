import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="w-64 border-r border-primary/20 bg-slate-900 dark:bg-slate-900 flex flex-col shrink-0 min-h-screen">
            <div className="p-6 flex flex-col gap-8 h-full">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3">
                    <div className="bg-primary rounded-lg p-2 text-white">
                        <span className="material-symbols-outlined">directions_car</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white text-base font-bold leading-none">AutoGestion</h1>
                        <p className="text-slate-custom-600 text-xs font-medium">Admin Pro</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 flex-1">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm font-medium">Tableau de bord</span>
                    </NavLink>

                    <NavLink
                        to="/admin/cars"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">garage</span>
                        <span className="text-sm font-medium">Flotte</span>
                    </NavLink>

                    <NavLink
                        to="/admin/contracts"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">description</span>
                        <span className="text-sm font-medium">Contrats</span>
                    </NavLink>

                    <NavLink
                        to="/admin/invoices"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">receipt_long</span>
                        <span className="text-sm font-medium">Factures</span>
                    </NavLink>

                    <NavLink
                        to="/admin/services"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">build</span>
                        <span className="text-sm font-medium">Services</span>
                    </NavLink>

                    <NavLink
                        to="/admin/clients"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-sm font-medium">Clients</span>
                    </NavLink>

                    <NavLink
                        to="/admin/reviews"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">star_rate</span>
                        <span className="text-sm font-medium">Avis & IA</span>
                    </NavLink>

                    <div className="pt-2 mt-2 border-t border-slate-custom-800">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rapports</p>
                        <NavLink
                            to="/admin/reports"
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span className="text-sm font-medium">Mensuels</span>
                        </NavLink>

                        <NavLink
                            to="/admin/reports/export"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">picture_as_pdf</span>
                            <span className="text-sm font-medium">Export PDF</span>
                        </NavLink>

                        <NavLink
                            to="/admin/reports/forecasts"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-custom-600 hover:bg-primary/10 hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">trending_up</span>
                            <span className="text-sm font-medium">Prévisions</span>
                        </NavLink>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="mt-auto pt-6 border-t border-slate-custom-800">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full bg-primary/20 bg-cover bg-center shrink-0"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUKsugI-YX30fcfti6Kv2ie-i9gFZBaA7DfKZPY09hp33yMyrdxwuQz-JzjRJ8WcDYrBeXTf-4OYchEurjP-63JvNk3naECP_MTefP1zwQZew2FyNe6ycw3hABuLXcg_8IJpp2lL562NY-HXdhN2dk1PjVuD-dpXelwiKmo6LHS53qh1DeuV6E-zJJnaBYsX3FXCtSWTD1nhnRDwlwH5eS5ZJxqGLGOEouZQmXsOQtxTr5CKaC80fjg4ubgg2D5wUbPrUdMXL_-BjI')" }}
                        ></div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white text-sm font-medium truncate">Marc Lefebvre</span>
                            <span className="text-slate-custom-600 text-xs truncate">Manager</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
