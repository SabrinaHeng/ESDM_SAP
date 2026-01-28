sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
            const oData = this._createInitialRegistrationData();
            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "registration");
            this._recalculateCredits();
        },

        _createInitialRegistrationData() {
            // Sample data – in real app, load from OData service bound to HANA
            const aCourses = [
                {
                    id: "BCS3013-01",
                    code: "BCS3013",
                    shortCode: "BCS3013",
                    name: "Software Engineering",
                    lecturer: "Dr. Siti Aminah",
                    dayTime: "Mon 8:00–11:00, Wed 2:00–4:00",
                    creditHours: 3,
                    type: "Core",
                    section: "01",
                    selected: false
                },
                {
                    id: "BCS3023-02",
                    code: "BCS3023",
                    shortCode: "BCS3023",
                    name: "Database Systems",
                    lecturer: "Prof. Ahmad Zaki",
                    dayTime: "Tue 9:00–12:00, Thu 3:00–5:00",
                    creditHours: 3,
                    type: "Core",
                    section: "02",
                    selected: false
                },
                {
                    id: "BCS3033-01",
                    code: "BCS3033",
                    shortCode: "BCS3033",
                    name: "Web Application Development",
                    lecturer: "Dr. Nurul Huda",
                    dayTime: "Wed 8:00–11:00, Fri 2:00–4:00",
                    creditHours: 3,
                    type: "Core",
                    section: "01",
                    selected: false
                },
                {
                    id: "BCS3043-03",
                    code: "BCS3043",
                    shortCode: "BCS3043",
                    name: "Computer Networks",
                    lecturer: "Dr. Muhammad Faiz",
                    dayTime: "Mon 2:00–5:00",
                    creditHours: 3,
                    type: "Core",
                    section: "03",
                    selected: false
                }
            ];

            return {
                minCredits: 9,
                maxCredits: 21,
                totalCredits: 0,
                selectedCount: 0,
                availableCount: aCourses.length,
                totalCount: aCourses.length,
                statusMessage: "",
                statusType: "Information",
                canRegister: false,
                courses: aCourses
            };
        },

        onToggleCourse(oEvent) {
            const oButton = oEvent.getSource();
            const oCtx = oButton.getBindingContext("registration");
            if (!oCtx) {
                return;
            }

            const sPath = oCtx.getPath(); // e.g. "/courses/0"
            const oModel = oCtx.getModel();
            const bSelected = oCtx.getProperty("selected");

            oModel.setProperty(sPath + "/selected", !bSelected);
            this._recalculateCredits();
        },

        _recalculateCredits() {
            const oModel = this.getView().getModel("registration");
            const aCourses = oModel.getProperty("/courses") || [];
            const iMin = oModel.getProperty("/minCredits");
            const iMax = oModel.getProperty("/maxCredits");

            let iTotal = 0;
            let iSelectedCount = 0;

            aCourses.forEach((c) => {
                if (c.selected) {
                    iTotal += c.creditHours;
                    iSelectedCount += 1;
                }
            });

            let sMessage = "";
            let sType = "Information";
            let bCanRegister = true;

            if (iTotal === 0) {
                sMessage = "No courses selected. Please select courses to register.";
                sType = "Information";
                bCanRegister = false;
            } else if (iTotal < iMin) {
                sMessage = `Insufficient credit hours. Minimum required is ${iMin}.`;
                sType = "Warning";
                bCanRegister = false;
            } else if (iTotal > iMax) {
                sMessage = `Credit hours exceeded. Maximum allowed is ${iMax}.`;
                sType = "Warning";
                bCanRegister = false;
            } else {
                sMessage = "Credit hours within allowed range.";
                sType = "Success";
                bCanRegister = true;
            }

            oModel.setProperty("/totalCredits", iTotal);
            oModel.setProperty("/selectedCount", iSelectedCount);
            oModel.setProperty("/statusMessage", sMessage);
            oModel.setProperty("/statusType", sType);
            oModel.setProperty("/canRegister", bCanRegister);
        },

        onSearchCourses(oEvent) {
            const sQuery = oEvent.getParameter("query") || "";
            this._applyCourseSearch(sQuery);
        },

        onLiveChangeSearch(oEvent) {
            const sQuery = oEvent.getParameter("newValue") || "";
            this._applyCourseSearch(sQuery);
        },

        _applyCourseSearch(sQuery) {
            const oTable = this.byId("coursesTable");
            const oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }

            if (!sQuery) {
                oBinding.filter([]);
                return;
            }

            const Filter = sap.ui.require("sap/ui/model/Filter");
            const FilterOperator = sap.ui.require("sap/ui/model/FilterOperator");

            if (!Filter || !FilterOperator) {
                return;
            }

            const aFilters = [
                new Filter("code", FilterOperator.Contains, sQuery),
                new Filter("name", FilterOperator.Contains, sQuery),
                new Filter("lecturer", FilterOperator.Contains, sQuery)
            ];

            oBinding.filter(new Filter({
                filters: aFilters,
                and: false
            }));
        },

        onRegister() {
            const oModel = this.getView().getModel("registration");
            const aSelected = (oModel.getProperty("/courses") || []).filter((c) => c.selected);

            // Here you would call the OData service that persists to HANA
            // For now, just show a toast
            MessageToast.show(`${aSelected.length} courses registered (${oModel.getProperty("/totalCredits")} credits).`);
        },

        onSaveDraft() {
            const oModel = this.getView().getModel("registration");
            const aSelected = (oModel.getProperty("/courses") || []).filter((c) => c.selected);

            // Draft save would call a backend service; here we simulate it
            MessageToast.show(`Draft saved with ${aSelected.length} course(s).`);
        }
    });
});