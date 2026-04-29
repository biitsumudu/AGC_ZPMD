sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/suite/ui/generic/template/displayMode"
], function (MessageToast, Fragment, displayMode) {
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

        continueNewRequest1: function () {
            const oDataModel = this.getView().getModel();
            var oModel = this.getView().getModel("decisionTree");
            var oSelectedOption = oModel.getProperty("/selectedOption");

            this.oDialog.then(oDialog => {
                oDialog.close();

                var targetPath = "/header(-)";

                oModel.createBindingContext(targetPath, null, {}, oContext => {
                    var oNavControl = this.extensionAPI.getNavigationController();
                    oNavControl.navigateInternal(oContext, {
                        replaceInHistory: false,
                        displayMode: sap.suite.ui.generic.template.displayMode.create,
                    });
                }, true);
            });
        },

        continueNewRequest: function () {
            const oDataModel = this.getView().getModel();
            const oDecisionModel = this.getView().getModel("decisionTree");
            const oSelectedOption = oDecisionModel.getProperty("/selectedOption");

            this.oDialog.then(oDialog => {
                oDialog.close();

                var oPayload = {
                    ProductType: oSelectedOption.Value
                };

                oDataModel.create("/header", oPayload, {
                    success: (oCreatedEntry, oResponse) => {
                        var sPath = oDataModel.getKey(oCreatedEntry);
                        var oNewContext = new sap.ui.model.Context(oDataModel, sPath);
                        var oNavControl = this.extensionAPI.getNavigationController();
                        oNavControl.navigateInternal(oNewContext, {
                            replaceInHistory: false,
                            displayMode: displayMode.edit,
                            isAbsolute: true
                        });
                    },
                    error: oError => {
                        MessageToast.show("Error creating entry: " + oError.message);
                    }
                });
            });
        },

        continueNewRequest2: function () {
            const oDataModel = this.getView().getModel();
            const oDecisionModel = this.getView().getModel("decisionTree");
            const oSelectedOption = oDecisionModel.getProperty("/selectedOption");

            this.oDialog.then(oDialog => {
                oDialog.close();

                var oPayload = {
                    ProductType: oSelectedOption.Value
                };

                var oNewEntry = oDataModel.createEntry("/header", {
                    inactive: false,
                    refreshAfterChange: true,
                    properties: oPayload,
                    created: (oCreatedEntry) => {
                        var oNavControl = this.extensionAPI.getNavigationController();
                        oNavControl.navigateInternal(oCreatedEntry, {
                            replaceInHistory: false,
                            displayMode: "edit"
                        });
                    },
                    success: (oCreatedEntry, oResponse) => {
                    },
                    error: oError => {
                        MessageToast.show("Error creating entry: " + oError.message);
                    }
                });
            });
        }

    };
});
