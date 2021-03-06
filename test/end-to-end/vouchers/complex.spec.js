/* global browser, element, by */

'use strict';

const helpers = require('../shared/helpers');
const components = require('../shared/components');
const ComplexVoucherPage = require('./complex.page');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

describe('Complex Vouchers', function () {

  before(() => helpers.navigate('vouchers/complex'));

  it('creates a complex voucher', function () {
    const page = new ComplexVoucherPage();

    // set a new timeout to avoid warnings
    this.timeout(45000);

    /*
     * the voucher we will use in this page
     * NOTA: the Test Capital One is a financial account which involve that we
     * specify the transfer type
     */
    const voucher = {
      date        : new Date(),
      description : 'Complex voucher test e2e',
      rows        : [
        { account: 'Test Debtor Accounts1', debit: 18, credit: 0, entity: { type: 'D', name: 'Patient/2/Patient' } },
        { account: 'Test Capital One', debit: 0, credit: 8, reference: { type: 'voucher', index: 0 } },
        { account: 'Test Capital Two', debit: 0, credit: 5, reference: { type: 'voucher', index: 2 } },
        { account: 'First Test Item Account', debit: 0, credit: 5, reference: { type: 'voucher', index: 1 } },
        { account: 'Test Capital One', debit: 7, credit: 0, entity: { type: 'C', name: 'Fournisseur' } },
        { account: 'Test Capital Two', debit: 0, credit: 7, reference: { type: 'patient-invoice', index: 1 } },
      ],
    };

    // configure the date to today
    page.date(voucher.date);

    // set the description
    page.description(voucher.description);

    // set the currency to USD
    page.currency(2);

    // add four rows
    page.addRow();
    page.addRow();
    page.addRow();
    page.addRow();

    // loop through each row and assign the correct form values
    voucher.rows.forEach((row, idx) => {
      let current = page.row(idx);
      current.account(row.account);
      current.debit(row.debit);
      current.credit(row.credit);
      if (row.entity) {
        current.entity(row.entity.type, row.entity.name);
      }
      if (row.reference) {
        current.reference(row.reference.type, row.reference.index);
      }
    });

    /*
     * set the transaction type to one which have a specific Id
     * (e.g. cash payment Id is 1)
     * @see client/src/js/services/VoucherService.js
     */
    page.transactionType('Autres R');

    // submit the page
    page.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('forbid submit when there is no transfer type for financial account', function () {
    const page = new ComplexVoucherPage();

    /*
     * the voucher we will use in this page
     * NOTA: the Test Capital One is a financial account which involve that we
     * specify the transfer type
     */
    const voucher = {
      date        : new Date(),
      description : 'Complex voucher test e2e',
      rows        : [
        { account: 'Test Debtor Accounts1', debit: 17, credit: 0, entity: { type: 'D', name: 'Patient/2/Patient' }},
        { account: 'Test Capital One', debit: 0, credit: 17, reference: { type: 'voucher', index: 0 }}
      ]
    };

    // configure the date to today
    page.date(voucher.date);

    // set the description
    page.description(voucher.description);

    // set the currency to USD
    page.currency(2);

    // loop through each row and assign the correct form values
    voucher.rows.forEach((row, idx) => {
      let current = page.row(idx);
      current.account(row.account);
      current.debit(row.debit);
      current.credit(row.credit);
      if (row.entity) {
        current.entity(row.entity.type, row.entity.name);
      }
      if (row.reference) {
        current.reference(row.reference.type, row.reference.index);
      }
    });

    // submit the page
    page.submit();

    // expect a danger notification
    components.notification.hasDanger();
  });

  it('Convention import invoices and payment via the tool', () => {

    let detail = {
      tool            : 'Convention - Paiement factures',
      cashbox         : '$',
      convention      : 'Second Test',
      invoices        : [0, 1],
      description     : 'Convention payment with journal voucher',
      transactionType : 'Convention',
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the convention
    components.debtorGroupSelect.set(detail.convention);

    // select invoices
    GU.selectRow('invoiceGrid', detail.invoices[0]);

    // validate selection
    FU.modal.submit();

    // description
    FU.input('ComplexVoucherCtrl.Voucher.details.description', detail.description);

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Support Patient Invoices by an Account via the tool', () => {
    const page = new ComplexVoucherPage();

    let detail = {
      tool          : 'Prise en Charge des patients',
      accountNumber : 42002,
      patientName   : 'Test 2',
      description   : 'Patient support invoices',
      invoices      : [0, 1],
    };

    // click on the Support Patient Tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select account
    components.accountSelect.set(detail.accountNumber);

    // Find Patient
    components.findPatient.findByName(detail.patientName);    


    // select invoices
    GU.selectRow('invoiceGrid', detail.invoices[0]);

    // validate selection
    FU.modal.submit();

    // description
    FU.input('ComplexVoucherCtrl.Voucher.details.description', detail.description);

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Generic Income via the tool', () => {

    let detail = {
      tool        : 'Recette Generique',
      cashbox     : 'Test Primary Cashbox A',
      account     : '41001',
      description : 'E2E RECETTE GENERIQUE',
      amount      : 3000,
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox (the first ie Fc)
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    FU.typeahead('ToolCtrl.account', detail.account);

    // description
    FU.input('ToolCtrl.description', detail.description);

    // amount
    FU.input('ToolCtrl.amount', detail.amount);

    // validate selection
    FU.modal.submit();

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Generic Expense via the tool', () => {

    let detail = {
      tool        : 'Depense Generique',
      cashbox     : 'Test Primary Cashbox A',
      account     : '41001',
      description : 'E2E DEPENSE GENERIQUE',
      amount      : 1000,
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox (the first ie Fc)
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    FU.typeahead('ToolCtrl.account', detail.account);

    // description
    FU.input('ToolCtrl.description', detail.description);

    // amount
    FU.input('ToolCtrl.amount', detail.amount);

    // validate selection
    FU.modal.submit();

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });

  it('Cash Transfer via the tool', () => {

    let detail = {
      tool    : 'Transfert d\'argent',
      cashbox : 'Test Primary Cashbox A',
      account : '41001',
      amount  : 20,
    };

    // click on the convention tool
    FU.dropdown('[toolbar-dropdown]', detail.tool);

    // select the cashbox (the first ie $)
    FU.uiSelect('ToolCtrl.cashbox', detail.cashbox);

    // select the account
    FU.typeahead('ToolCtrl.account', detail.account);

    // amount
    FU.input('ToolCtrl.amount', detail.amount);

    // validate selection
    FU.modal.submit();

    // submit voucher
    FU.buttons.submit();

    // make sure a receipt was opened
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-method="close"]').click();
  });
});
