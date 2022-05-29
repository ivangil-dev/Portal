import AppContext from '../../AppContext';

import {useContext, useEffect, useState} from 'react';
import {getSiteNewsletters} from '../../utils/helpers';
import setupGhostApi from '../../utils/api';
import NewsletterManagement from '../common/NewsletterManagement';
import CloseButton from '../common/CloseButton';

const React = require('react');

function SiteLogo() {
    const {site} = useContext(AppContext);
    const siteLogo = site.icon;

    if (siteLogo) {
        return (
            <img className='gh-portal-unsubscribe-logo' src={siteLogo} alt={site.title} />
        );
    }
    return (null);
}

function AccountHeader() {
    const {site} = useContext(AppContext);
    const siteTitle = site.title || '';
    return (
        <header className='gh-portal-header'>
            <SiteLogo />
            <h2 className="gh-portal-publication-title">{siteTitle}</h2>
        </header>
    );
}

async function updateMemberNewsletters({api, memberUuid, newsletters}) {
    try {
        return await api.member.updateNewsletters({uuid: memberUuid, newsletters});
    } catch (e) {
        // ignore auto unsubscribe error
    }
}

export default function UnsubscribePage() {
    const {site, pageData, onAction} = useContext(AppContext);
    const api = setupGhostApi({siteUrl: site.url});
    const [member, setMember] = useState();
    const siteNewsletters = getSiteNewsletters({site});
    const defaultNewsletters = siteNewsletters.filter((d) => {
        return d.subscribe_on_signup;
    });
    const [hasInteracted, setHasInteracted] = useState(false);
    const [subscribedNewsletters, setSubscribedNewsletters] = useState(defaultNewsletters);
    const [showPrefs, setShowPrefs] = useState(false);

    useEffect(() => {
        const ghostApi = setupGhostApi({siteUrl: site.url});
        (async () => {
            const memberData = await ghostApi.member.newsletters({uuid: pageData.uuid});

            setMember(memberData);
            const memberNewsletters = memberData?.newsletters || [];
            setSubscribedNewsletters(memberNewsletters);
            if (siteNewsletters?.length === 1) {
                const updatedData = await updateMemberNewsletters({
                    api: ghostApi,
                    memberUuid: pageData.uuid,
                    newsletters: []
                });
                setSubscribedNewsletters(updatedData.newsletters);
            } else if (pageData.newsletterUuid) {
                const updatedData = await updateMemberNewsletters({
                    api: ghostApi,
                    memberUuid: pageData.uuid,
                    newsletters: memberNewsletters?.filter((d) => {
                        return d.uuid !== pageData.newsletterUuid;
                    })
                });
                setSubscribedNewsletters(updatedData.newsletters);
            }
        })();
    }, [pageData.uuid, pageData.newsletterUuid, site.url, siteNewsletters?.length]);

    // Case: Email not found
    if (member === null) {
        return (
            <div className='gh-portal-content gh-portal-unsubscribe with-footer'>
                <CloseButton />
                <AccountHeader />
                <h1 className="gh-portal-main-title">La cancelación de la suscripción ha fallado</h1>
                <div>
                    <p className="gh-portal-text-center">Dirección de correo electrónico no encontrada.</p>
                </div>
            </div>
        );
    }

    // Case: Single active newsletter
    if (siteNewsletters?.length === 1 && !showPrefs) {
        return (
            <div className='gh-portal-content gh-portal-unsubscribe with-footer'>
                <CloseButton />
                <AccountHeader />
                <h1 className="gh-portal-main-title">Baja en suscripción realizada con éxito</h1>
                <div>
                    <p className='gh-portal-text-center'><strong>{member?.email}</strong> ya no recibirá este boletín.</p>
                    <p className='gh-portal-text-center'>¿No querías hacer esto? Cambia tus preferencias
                        <button
                            className="gh-portal-btn-link gh-portal-btn-branded gh-portal-btn-inline"
                            onClick={() => {
                                setShowPrefs(true);
                            }}
                        >
                        aquí
                        </button>.
                    </p>
                </div>
            </div>
        );
    }

    const HeaderNotification = () => {
        const unsubscribedNewsletter = siteNewsletters?.find((d) => {
            return d.uuid === pageData.newsletterUuid;
        });
        const hideClassName = hasInteracted ? 'gh-portal-hide' : '';
        return (
            <p className={`gh-portal-text-center gh-portal-header-message ${hideClassName}`}><strong>{member?.email}</strong> ya no recibirá el boletín informativo <strong>{unsubscribedNewsletter?.name}</strong>.</p>
        );
    };

    return (
        <NewsletterManagement
            notification={HeaderNotification}
            subscribedNewsletters={subscribedNewsletters}
            updateSubscribedNewsletters={async (newsletters) => {
                setSubscribedNewsletters(newsletters);
                setHasInteracted(true);
                await api.member.updateNewsletters({uuid: pageData.uuid, newsletters});
            }}
            unsubscribeAll={async () => {
                setHasInteracted(true);
                setSubscribedNewsletters([]);
                onAction('showPopupNotification', {
                    action: 'updated:success',
                    message: `Preferencias del boletín actualizadas.`
                });
                await api.member.updateNewsletters({uuid: pageData.uuid, newsletters: []});
            }}
            isPaidMember={member?.status !== 'free'}
        />
    );
}
