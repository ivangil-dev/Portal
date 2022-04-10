import AppContext from '../../AppContext';
import CloseButton from '../common/CloseButton';
import BackButton from '../common/BackButton';
import {useContext} from 'react';
import Switch from '../common/Switch';
import {getSiteNewsletters} from '../../utils/helpers';
import ActionButton from '../common/ActionButton';

const React = require('react');

function AccountHeader() {
    const {brandColor, lastPage, onAction} = useContext(AppContext);
    return (
        <header className='gh-portal-detail-header'>
            <BackButton brandColor={brandColor} hidden={!lastPage} onClick={(e) => {
                onAction('back');
            }} />
            <h3 className='gh-portal-main-title'>Preferencias de correo electrónico</h3>
        </header>
    );
}

function NewsletterPrefSection({newsletter}) {
    const {onAction, member} = useContext(AppContext);
    let newsletters = [...(member.newsletters || [])];
    const isChecked = newsletters.some((d) => {
        return d.id === newsletter?.id;
    });
    return (
        <section>
            <div className='gh-portal-list-detail'>
                <h3>{newsletter.name}</h3>
                <p>{newsletter.description}</p>
            </div>
            <div>
                <Switch id={newsletter.id} onToggle={(e, checked) => {
                    onAction('showPopupNotification', {
                        action: 'updated:success',
                        message: `${newsletter.name} newsletter preference updated.`
                    });
                    if (!checked) {
                        newsletters = newsletters.filter((d) => {
                            return d.id !== newsletter.id;
                        });
                    } else {
                        newsletters = newsletters.filter((d) => {
                            return d.id !== newsletter.id;
                        }).concat(newsletter);
                    }
                    onAction('updateNewsletterPreference', {newsletters});
                }} checked={isChecked} />
            </div>
        </section>
    );
}

function NewsletterPrefs() {
    const {site} = useContext(AppContext);
    const newsletters = getSiteNewsletters({site});
    return newsletters.map((newsletter) => {
        return (
            <NewsletterPrefSection key={newsletter?.id} newsletter={newsletter} />
        );
    });
}

export default function AccountEmailPage() {
    const {brandColor} = useContext(AppContext);
    return (
        <div className='gh-portal-content with-footer'>
            <CloseButton />
            <AccountHeader />
            <div className='gh-portal-section'>Actualizar
                <div className='gh-portal-list'>
                    <NewsletterPrefs />
                </div>
            </div>
            <footer className='gh-portal-action-footer'>
                <div style={{width: '100%'}}>
                    <div style={{marginBottom: '12px'}}>
                        <ActionButton
                            isRunning={false}
                            onClick={(e) => {}}
                            disabled={false}
                            brandColor={brandColor}
                            label=''
                            style={{width: '100%'}}
                        />
                    </div>
                    <ActionButton
                        isRunning={false}
                        onClick={(e) => {}}
                        disabled={false}
                        brandColor={brandColor}
                        isPrimary={false}
                        label='Darse de baja de todos'
                        isDestructive={true}
                        style={{width: '100%'}}
                    />
                    <p style={{textAlign: 'center', marginTop: '12px', marginBottom: '0', color: 'var(--grey6)'}}>Cancelar la suscripción a los correos electrónicos no cancelará tu suscripción de pago.</p>
                </div>
            </footer>
        </div>
    );
}
