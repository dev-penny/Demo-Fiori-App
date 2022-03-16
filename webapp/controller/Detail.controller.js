sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/List",
    "sap/m/StandardListItem",
    'sap/m/ColumnListItem',
    'sap/m/Input'
],
    function (Controller, MessageBox, MessageToast, JSONModel, ColumnListItem, Input, Dialog, Button, ButtonType, List, StandardListItem) {
        "use strict";

        return Controller.extend("project1.controller.Detail", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function (oEvent) {
                var that = this;
                var oArgs, oView;
                oArgs = oEvent.getParameter("arguments");
                oView = this.getView();
                var odataModel = new sap.ui.model.odata.v2.ODataModel("/V2/Northwind/Northwind.svc/");
                //Bind Orders with Order_Details
                odataModel.read("/Orders(" + oArgs.OrderId + ")/Order_Details", {
                    success: function (oData, oResponse) {

                        // MessageBox.success("Success");

                        //Products Model
                        var jsonmodel = new JSONModel();
                        jsonmodel.setProperty("/NewProducts", oData.results);
                        that.getView().setModel(jsonmodel, "newModel");

                        //Header Model
                        var headermodel = new JSONModel();
                        headermodel.setData({OrderID: oArgs.OrderId,numberProducts: oData.results.length});
                        that.getView().setModel(headermodel, "newHeaderModel");

                        //Visible Model for Edit-Save buttons
                        var visiblemodel = new JSONModel({
                            text: true,
                            stepinput: false,
                            save: false,
                            edit: true
                        });
                        that.getView().setModel(visiblemodel, "visibleModel");

                    },
                    error: function (oError) {
                        MessageBox.error("Error");
                    }
                });
            },

            /*
		    *Fragment behavior - Insert Products.
		    */
            _getDialogLogs: function () {
                var that = this;
                var oView;
                oView = this.getView();
                //Bind Products
                var odataModel = new sap.ui.model.odata.v2.ODataModel("/V2/Northwind/Northwind.svc/");
                odataModel.read("/Products", {
                    success: function (oData, oResponse) {

                        // MessageBox.success("Success");

                        var jsonmodel = new JSONModel();
                        jsonmodel.setProperty("/NewProductsList", oData.results);
                        that.getView().setModel(jsonmodel, "newModelList");


                    },
                    error: function (oError) {
                        MessageBox.error("Error");
                    }
                });


                // create dialog lazily
                if (!this._oDialogLogs) {
                    // create dialog via fragment factory
                    this._oDialogLogs = sap.ui.xmlfragment('logsDialog',
                        'project1.view.logsDialog', this);
                    // connect dialog to view (models, lifecycle)
                    this.getView().addDependent(this._oDialogLogs);
                }
                return this._oDialogLogs;
            },
            onCloseDialogLogs: function () {
                this._getDialogLogs().close();
                this._getDialogLogs().destroy();
                this._oDialogLogs = undefined;
            },
            onOpenDialogLogs: function () {
                this._getDialogLogs().open();

            },

            /*
		    *Add products - fragment.
		    */
            onAddproducts: function (oEvent) {
                var currentObj;
                currentObj = oEvent.getSource().getBindingContext("newModelList").getObject();
                currentObj.Quantity = 1;
                var oModel = this.getView().getModel("newModel");
                var aData = oModel.getProperty("/NewProducts");
                for (let i=0; i<aData.length; i++){
                    if(aData[i].ProductID==currentObj.ProductID){
                        var exist=true;
                        aData[i].Quantity=aData[i].Quantity+1;
                    }
                    
                }
                if(!exist){
                    aData.push(currentObj);
                }

                //refresh the Quantity
                oModel.refresh(true);
                
                //refresh the number of products we add in the header 
                var currProd = this.getView().getModel("newHeaderModel").getData();
                currProd.numberProducts = aData.length;
                this.getView().getModel("newHeaderModel").refresh(true);    

            },

            /*
		    *Edit - Save Buttons.
		    */
            onEdit: function(oEvent) {
                var oModel = this.getView().getModel("visibleModel").getData();
                oModel.text=false;
                oModel.stepinput=true;
                oModel.save=true;
                oModel.edit=false;
                this.getView().getModel("visibleModel").refresh(true);
            },
            onSave: function(oEvent) {
                var oModel = this.getView().getModel("visibleModel").getData();
                oModel.text=true;
                oModel.stepinput=false;
                oModel.save=false;
                oModel.edit=true;
                this.getView().getModel("visibleModel").refresh(true);   
            },

            /*
		    *Delete an entry - Delete a product.
		    */
           onDelete : function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext("newModel").getPath();
                var index = sPath.slice(sPath.length - 1);
                var oModel = this.getView().getModel("newModel");
                var aData = oModel.getProperty("/NewProducts/");
                aData.splice(index, 1);
                oModel.refresh(true);

                //refresh the number of products we delete in the header 
                var currProd = this.getView().getModel("newHeaderModel").getData();
                currProd.numberProducts = aData.length;
                this.getView().getModel("newHeaderModel").refresh(true);    

		    },

            /*
		    *Delete all entries.
		    */
            onDeleteAll: function (oEvent) {
                var oModel = this.getView().getModel("newModel");
                //Set property with an empty array
                oModel.setProperty("/NewProducts", []);
                oModel.refresh(true);

                //Refresh the number of products we delete in the header 
                var aData = oModel.getProperty("/NewProducts/");
                var currProd = this.getView().getModel("newHeaderModel").getData();
                currProd.numberProducts = aData.length;
                this.getView().getModel("newHeaderModel").refresh(true);  

		    },

            /*
		    *Fragment behavior - ProductID details.
		    */
           _getDialogLogsView: function (oEvent) {
                // create dialog lazily
                if (!this._oDialogLogs) {
                    // create dialog via fragment factory
                    this._oDialogLogs = sap.ui.xmlfragment('ViewDetailsDialog',
                        'project1.view.ViewDetailsDialog', this);
                    // connect dialog to view (models, lifecycle)
                    this.getView().addDependent(this._oDialogLogs);
                }
                return this._oDialogLogs;
            },
            onCloseDialogLogsView: function () {
                this._getDialogLogsView().close();
                this._getDialogLogsView().destroy();
                this._oDialogLogs = undefined;
            },
            onOpenDialogLogsView: function (oEvent) {
                var selectedObj = oEvent.getSource().getBindingContext("newModel").getObject();
                //Create a new copy JSONModel of newModel
                var newProdModel = new JSONModel({
                                "ProductName": selectedObj.ProductName,
                                "UnitPrice": selectedObj.UnitPrice,
                                "Quantity": selectedObj.Quantity
                            });
                
                this.getView().setModel( newProdModel, "productModel");
                //Open the dialog
                this._getDialogLogsView().open();

            },

        });
    });