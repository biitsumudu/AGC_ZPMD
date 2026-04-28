sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (MessageToast, Fragment) {
    'use strict';

    return {
        NewRequest: function (oEvent) {
            var oView = this.getView();

            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.agc.pmd.productrequest.ext.fragment.NewRequestList",
                    controller: this
                }).then(oDialog => {
                    oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.oDialog.then(oDialog => {
                oDialog.open();
            });
        },

        onDialogAfterOpen: function () {
            // Handle any actions needed after the dialog is opened
            var jModel = this.getView().getModel("decisionTree");
            var aData = jModel.getProperty("/DecisionTree");
            jModel.setProperty("/currentStep", aData[0]);
        },

        handleWizardCancel: function () {
            this.oDialog.then(oDialog => {
                oDialog.close();
            });
        },

        onDecisionOptionPress: function (oEvent) {
            var oModel = this.getView().getModel("decisionTree");
            var oSelectedOption = oEvent.getSource().getBindingContext("decisionTree").getObject();

            if (oSelectedOption.NextStep) {
                // Find the next question object in the array
                var aQuestions = oModel.getProperty("/DecisionTree");
                var oNextStepData = aQuestions.find(q => q.QuestionID === oSelectedOption.NextStep);

                // Update the model - The QuestionText in the UI updates instantly!
                oModel.setProperty("/currentStep", oNextStepData);
            } else {
                // No next step? You found the Material Type!
                MessageToast.show("Material Type: " + oSelectedOption.Value);
            }
        }

    };
});
