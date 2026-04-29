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
            jModel.setProperty("/selectedOption", null); // Reset selected option when dialog opens
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
                // Set the selected option
                oModel.setProperty("/selectedOption", oSelectedOption);
            } else {
                // No next step? You found the Material Type!
                oModel.setProperty("/selectedOption", oSelectedOption);
                MessageToast.show("Material Type: " + oSelectedOption.Value);
            }
        },

        handleWizardRestart: function () {
            var oModel = this.getView().getModel("decisionTree");
            var aData = oModel.getProperty("/DecisionTree");
            oModel.setProperty("/currentStep", aData[0]);
            oModel.setProperty("/selectedOption", null); // Reset selected option when restarting
        },

        continueNewRequest: function () {
            const oDataModel = this.getView().getModel();
            const oDecisionModel = this.getView().getModel("decisionTree");
            const oSelectedOption = oDecisionModel.getProperty("/selectedOption");

            this.oDialog.then(oDialog => {
                var oPayload = {
                    ProductType: oSelectedOption.Value
                };
                oDialog.setBusy(true); // Show busy indicator while creating entry

                oDataModel.create("/header", oPayload, {
                    success: (oCreatedEntry, oResponse) => {
                        var sPath = oDataModel.getKey(oCreatedEntry);
                        var oNewContext = new sap.ui.model.Context(oDataModel, sPath);
                        var oNavControl = this.extensionAPI.getNavigationController();

                        oDialog.setBusy(false); // Hide busy indicator after entry is created
                        oDialog.close(); // Close the dialog after successful creation

                        oNavControl.navigateInternal(oNewContext, {
                            replaceInHistory: false,
                            displayMode: sap.suite.ui.generic.template.displayMode.edit,
                            isAbsolute: true
                        });
                    },
                    error: oError => {
                        oDialog.setBusy(false); // Hide busy indicator on error
                        MessageToast.show("Error creating entry: " + oError.message);
                    }
                });
            });
        },
    };
});
