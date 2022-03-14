import ActionButton from '../common/ActionButton';
import AppContext from '../../AppContext';
import {ReactComponent as CheckmarkIcon} from '../../images/icons/checkmark.svg';
import CloseButton from '../common/CloseButton';
import InputForm from '../common/InputForm';
import {getCurrencySymbol, getProductFromId, hasMultipleProductsFeature, isSameCurrency} from '../../utils/helpers';
import {ValidateInputForm} from '../../utils/form';
const React = require('react');

export const OfferPageStyles = `
    .gh-portal-offer {
        padding-bottom: 0;
        overflow: unset;
        max-height: unset;
    }

    .gh-portal-offer-container {
        display: flex;
        flex-direction: column;
    }

    .gh-portal-plans-container.offer {
        justify-content: space-between;
        border-color: var(--grey12);
        border-top: none;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        padding: 12px 16px;
        font-size: 1.3rem;
    }

    .gh-portal-offer-bar {
        position: relative;
        padding: 28px;
        margin-bottom: 24px;
        border: 1px dashed var(--brandcolor);
        border-radius: 6px;
    }

    .gh-portal-offer-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .gh-portal-offer-title h4 {
        font-size: 1.8rem;
        margin-bottom: 0;
    }

    .gh-portal-offer-bar p {
        padding-bottom: 0;
        margin: 12px 0 0;
    }

    .gh-portal-offer-title h4 + p {
        margin: 12px 0 0;
    }

    .gh-portal-offer-details .gh-portal-plan-name,
    .gh-portal-offer-details p {
        margin-right: 8px;
    }

    .gh-portal-offer .footnote {
        font-size: 1.35rem;
        color: var(--grey7);
        margin: 24px 0 0;
    }

    .offer .gh-portal-product-card {
        max-width: unset;
    }

    .offer .gh-portal-product-card .gh-portal-product-card-pricecontainer {
        margin-top: 0px;
    }

    .gh-portal-offer-oldprice {
        text-decoration: line-through;
        font-size: 2.2rem;
        font-weight: 300;
        color: var(--grey8);
        line-height: 1;
        white-space: nowrap;
        margin-top: 16px;
    }

    .gh-portal-offer-details p {
        margin-bottom: 12px;
    }
`;

export default class OfferPage extends React.Component {
    static contextType = AppContext;

    constructor(props, context) {
        super(props, context);
        this.state = {
            name: context?.member?.name || '',
            email: context?.member?.email || '',
            plan: 'free'
        };
    }

    getInputFields({state, fieldNames}) {
        const {portal_name: portalName} = this.context.site;
        const {member} = this.context;
        const errors = state.errors || {};
        const fields = [
            {
                type: 'email',
                value: member?.email || state.email,
                placeholder: 'jamie@example.com',
                label: 'Email',
                name: 'email',
                disabled: !!member,
                required: true,
                tabindex: 2,
                errorMessage: errors.email || ''
            }
        ];

        /** Show Name field if portal option is set*/
        let showNameField = !!portalName;

        /** Hide name field for logged in member if empty */
        if (!!member && !member?.name) {
            showNameField = false;
        }

        if (showNameField) {
            fields.unshift({
                type: 'text',
                value: member?.name || state.name,
                placeholder: 'Jamie Larson',
                label: 'Name',
                name: 'name',
                disabled: !!member,
                required: true,
                tabindex: 1,
                errorMessage: errors.name || ''
            });
        }
        fields[0].autoFocus = true;
        if (fieldNames && fieldNames.length > 0) {
            return fields.filter((f) => {
                return fieldNames.includes(f.name);
            });
        }
        return fields;
    }

    onKeyDown(e) {
        // Handles submit on Enter press
        if (e.keyCode === 13){
            this.handleSignup(e);
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const {pageData: offer, site} = this.context;
        if (!offer) {
            return null;
        }
        const product = getProductFromId({site, productId: offer.tier.id});
        const price = offer.cadence === 'month' ? product.monthlyPrice : product.yearlyPrice;
        this.setState((state) => {
            return {
                errors: ValidateInputForm({fields: this.getInputFields({state})})
            };
        }, () => {
            const {onAction} = this.context;
            const {name, email, errors} = this.state;
            const hasFormErrors = (errors && Object.values(errors).filter(d => !!d).length > 0);
            if (!hasFormErrors) {
                onAction('signup', {
                    name, email, plan: price?.id,
                    offerId: offer?.id
                });
                this.setState({
                    errors: {}
                });
            }
        });
    }

    handleInputChange(e, field) {
        const fieldName = field.name;
        const value = e.target.value;
        this.setState({
            [fieldName]: value
        });
    }

    renderSiteLogo() {
        const {site} = this.context;

        const siteLogo = site.icon;

        const logoStyle = {};

        if (siteLogo) {
            logoStyle.backgroundImage = `url(${siteLogo})`;
            return (
                <img className='gh-portal-signup-logo' src={siteLogo} alt={site.title} />
            );
        }
        return null;
    }

    renderFormHeader() {
        const {site} = this.context;
        const siteTitle = site.title || '';
        return (
            <header className='gh-portal-signup-header'>
                {this.renderSiteLogo()}
                <h2 className="gh-portal-main-title">{siteTitle}</h2>
            </header>
        );
    }

    renderForm() {
        const fields = this.getInputFields({state: this.state});

        return (
            <section>
                <div className='gh-portal-section'>
                    <InputForm
                        fields={fields}
                        onChange={(e, field) => this.handleInputChange(e, field)}
                        onKeyDown={e => this.onKeyDown(e)}
                    />
                </div>
            </section>
        );
    }

    renderSubmitButton() {
        const {action, brandColor} = this.context;
        let label = 'Continue';

        let isRunning = false;
        if (action === 'signup:running') {
            label = 'Sending...';
            isRunning = true;
        }
        let retry = false;
        if (action === 'signup:failed') {
            label = 'Retry';
            retry = true;
        }

        const disabled = (action === 'signup:running') ? true : false;
        return (
            <ActionButton
                style={{width: '100%', marginTop: '28px'}}
                retry={retry}
                onClick={e => this.handleSignup(e)}
                disabled={disabled}
                brandColor={brandColor}
                label={label}
                isRunning={isRunning}
                tabIndex='3'
            />
        );
    }

    renderLoginMessage() {
        const {member} = this.context;
        if (member) {
            return null;
        }
        const {brandColor, onAction} = this.context;
        return (
            <div className='gh-portal-signup-message'>
                <div>Already a member?</div>
                <button
                    className='gh-portal-btn gh-portal-btn-link'
                    style={{color: brandColor}}
                    onClick={() => onAction('switchPage', {page: 'signin'})}
                >
                    <span>Sign in</span>
                </button>
            </div>
        );
    }

    renderOfferTag() {
        const {pageData: offer} = this.context;
        if (offer.type === 'fixed') {
            return (
                <h5 className="gh-portal-discount-label">{getCurrencySymbol(offer.currency)}{offer.amount / 100} off</h5>
            );
        }
        return (
            <h5 className="gh-portal-discount-label">{offer.amount}% off</h5>
        );
    }

    renderBenefits({product}) {
        const benefits = product.benefits || [];
        if (!benefits?.length) {
            return;
        }
        const benefitsUI = benefits.map((benefit, idx) => {
            return (
                <div className="gh-portal-product-benefit" key={`${benefit.name}-${idx}`}>
                    <CheckmarkIcon className='gh-portal-benefit-checkmark' />
                    <div className="gh-portal-benefit-title">{benefit.name}</div>
                </div>
            );
        });
        return (
            <div className="gh-portal-product-benefits">
                {benefitsUI}
            </div>
        );
    }

    getOriginalPrice({offer, product}) {
        const price = offer.cadence === 'month' ? product.monthlyPrice : product.yearlyPrice;
        const originalAmount = this.renderRoundedPrice(price.amount / 100);
        return `${getCurrencySymbol(price.currency)}${originalAmount}/${offer.cadence}`;
    }

    getUpdatedPrice({offer, product}) {
        const price = offer.cadence === 'month' ? product.monthlyPrice : product.yearlyPrice;
        const originalAmount = price.amount;
        let updatedAmount;
        if (offer.type === 'fixed' && isSameCurrency(offer.currency, price.currency)) {
            updatedAmount = ((originalAmount - offer.amount)) / 100;
            return updatedAmount > 0 ? updatedAmount : 0;
        } else if (offer.type === 'percent') {
            updatedAmount = (originalAmount - ((originalAmount * offer.amount) / 100)) / 100;
            return updatedAmount;
        }
        return originalAmount / 100;
    }

    renderRoundedPrice(price) {
        if (price % 1 !== 0) {
            const roundedPrice = Math.round(price * 100) / 100;
            return Number(roundedPrice).toFixed(2);
        }
        return price;
    }

    getOffAmount({offer}) {
        if (offer.type === 'fixed') {
            return `${getCurrencySymbol(offer.currency)}${offer.amount / 100}`;
        } else if (offer.type === 'percent') {
            return `${offer.amount}%`;
        }
        return '';
    }

    renderOfferMessage({offer, product}) {
        const discountDuration = offer.duration;
        let durationLabel = '';
        const originalPrice = this.getOriginalPrice({offer, product});
        let renewsLabel = '';
        if (discountDuration === 'once') {
            durationLabel = `for first ${offer.cadence}`;
            renewsLabel = `Renews at ${originalPrice}.`;
        } else if (discountDuration === 'forever') {
            durationLabel = `forever`;
        } else if (discountDuration === 'repeating') {
            const durationInMonths = offer.duration_in_months || '';
            if (durationInMonths === 1) {
                durationLabel = `for first month`;
            } else {
                durationLabel = `for first ${durationInMonths} months`;
            }
            renewsLabel = `Renews at ${originalPrice}.`;
        }
        return (
            <p className="footnote">{this.getOffAmount({offer})} off {durationLabel}. {renewsLabel}</p>
        );
    }

    renderProductLabel({product, offer}) {
        const {site} = this.context;

        if (hasMultipleProductsFeature({site})) {
            return (
                <h4 className="gh-portal-plan-name">{product.name} - {(offer.cadence === 'month' ? 'Monthly' : 'Yearly')}</h4>
            );
        }
        return (
            <h4 className="gh-portal-plan-name">{(offer.cadence === 'month' ? 'Monthly' : 'Yearly')}</h4>
        );
    }

    render() {
        const {pageData: offer, site} = this.context;
        if (!offer) {
            return null;
        }
        const product = getProductFromId({site, productId: offer.tier.id});
        const price = offer.cadence === 'month' ? product.monthlyPrice : product.yearlyPrice;
        const updatedPrice = this.getUpdatedPrice({offer, product});
        const benefits = product.benefits || [];

        const currencyClass = (getCurrencySymbol(price.currency)).length > 1 ? 'long' : '';

        return (
            <>
                <div className='gh-portal-content gh-portal-offer'>
                    <CloseButton />
                    {this.renderFormHeader()}

                    <div className="gh-portal-offer-bar">
                        <div className="gh-portal-offer-title">
                            {(offer.display_title ? <h4>{offer.display_title}</h4> : '')}
                            {this.renderOfferTag()}
                        </div>
                        {(offer.display_description ? <p>{offer.display_description}</p> : '')}
                    </div>

                    {this.renderForm()}

                    <div className='gh-portal-product-card'>
                        <div className='gh-portal-product-card-header'>
                            <h4 className="gh-portal-product-name">{product.name} - {(offer.cadence === 'month' ? 'Monthly' : 'Yearly')}</h4>
                            <div className="gh-portal-offer-oldprice">{getCurrencySymbol(price.currency)}{price.amount / 100}</div>
                            <div class="gh-portal-product-card-pricecontainer">    
                                <div class="gh-portal-product-price">
                                    <span class={'currency-sign ' + currencyClass}>{getCurrencySymbol(price.currency)}</span>
                                    <span class="amount">{this.renderRoundedPrice(updatedPrice)}</span>
                                    <span class="billing-period">/year</span>
                                </div>
                            </div>
                        </div>
                        <div className='gh-portal-product-card-details'>
                            <div className='gh-portal-product-card-detaildata'>
                                {(product.description ? <div className="gh-portal-product-description">{product.description}</div> : '')}
                                {(benefits.length ? this.renderBenefits({product}) : '')}
                                {this.renderOfferMessage({offer, product})}
                            </div>
                        </div>
                    </div>

                    {this.renderSubmitButton()}
                    {this.renderLoginMessage()}

                </div>
            </>
        );
    }
}
