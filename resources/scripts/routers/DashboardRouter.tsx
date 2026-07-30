import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import Sidebar from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faLayerGroup, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export default () => {
    const location = useLocation();
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);

    return (
        <>
            <NavigationBar />
            <Sidebar>
                <div className={'sidebar-section'}>Workspace</div>
                <NavLink to={'/'} exact>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faLayerGroup} />
                    </div>
                    Servers
                </NavLink>
                <div className={'sidebar-section'}>Account</div>
                {routes.account
                    .filter((route) => !!route.name)
                    .map(({ path, name, exact = false, iconProp }) => (
                        <NavLink key={path} to={`/account/${path}`.replace('//', '/')} exact={exact}>
                            <div className='icon'>
                                <FontAwesomeIcon icon={iconProp as IconProp} />
                            </div>
                            {name}
                        </NavLink>
                    ))}
                {rootAdmin && (
                    <>
                        <div className={'sidebar-section'}>Administration</div>
                        <a href={'/admin'}>
                            <div className='icon'>
                                <FontAwesomeIcon icon={faShieldAlt} />
                            </div>
                            Admin panel
                        </a>
                    </>
                )}
            </Sidebar>

            <TransitionRouter>
                <React.Suspense fallback={<Spinner centered />}>
                    <Switch location={location}>
                        <Route path={'/'} exact>
                            <DashboardContainer />
                        </Route>
                        {routes.account.map(({ path, component: Component }) => (
                            <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                <Component />
                            </Route>
                        ))}
                        <Route path={'*'}>
                            <NotFound />
                        </Route>
                    </Switch>
                </React.Suspense>
            </TransitionRouter>
        </>
    );
};
