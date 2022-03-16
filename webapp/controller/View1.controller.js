sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
    //  "sap/m/Label"  
], function (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator  ) {
		"use strict";
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	

		return Controller.extend("project1.controller.View1", {
			onInit: function () {
                var that = this;

                var odataModel = new sap.ui.model.odata.v2.ODataModel("/V2/Northwind/Northwind.svc/");
                odataModel.read("/Orders",{
                    success:function(oData,oResponse){
                        var Orders= [];
                        for (let i = 0; i < 20; i++) {

                            Orders.push(oData.results[i]);
                           
                        }
                        MessageBox.success("Success");
                        
                        var jsonmodel = new JSONModel();
                        jsonmodel.setProperty("/NewItems", Orders);
                        that.getView().setModel(jsonmodel,"globalModel");
                        
                        
                    },
                    error: function(oError){
                        MessageBox.error("Error");
                    }
                });
                              

            }, 

            onSearch: function(oEvent){
                //var sQuery = oEvent.getSource().getValue(); 
                var ShipCity= this.getView().byId("slShipCity").getValue();
                var ShipCountry= this.getView().byId("slShipCountry").getValue();
                var oFilter = new Filter({
                filters: [
                    //new Filter("OrderID", FilterOperator.EQ, sQuery),
                    //new Filter("ShipCity", FilterOperator.Contains, ShipCity),
                    //new Filter("ShipCountry", FilterOperator.Contains, ShipCountry)
                                        
                   ]
               
                });
                if(!ShipCity==""){
                    oFilter.aFilters.push(new Filter("ShipCity", FilterOperator.Contains, ShipCity));
                }
                if(!ShipCountry==""){
                    oFilter.aFilters.push(new Filter("ShipCity", FilterOperator.Contains, ShipCountry));
                }
                var comboBox= this.getView().byId("slOrder");
                var aSelected= comboBox.getSelectedKeys();
                for(let i=0; i<aSelected.length; i++){
                    oFilter.aFilters.push(new Filter("OrderID", FilterOperator.EQ, aSelected[i]));
                }
                if(oFilter.aFilters.length == 0){
                    oFilter=[];
                }
                var oBinding = this.byId("idOrdersTable").getBinding("items");
                oBinding.filter(oFilter);
             
            },
            
            handleSelectionChange: function(oEvent) {                
                
                var isSelected = oEvent.getParameter("selected");
    
                var state = "Selected";
                if (!isSelected) {
                    state = "Deselected";
                }
                

            },
            
            handleItemPress: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var selectedOrderId = oEvent.getSource().getBindingContext("globalModel").getProperty("OrderID");
                oRouter.navTo("Detail", {
                    OrderId: selectedOrderId
                });
            }
        
                
	    });
});