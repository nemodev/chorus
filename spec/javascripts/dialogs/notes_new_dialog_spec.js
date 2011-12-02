describe("NotesNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-entity-type='workfile' data-entity-id='1'></a>")
        this.dialog = new chorus.dialogs.NotesNew({launchElement : this.launchElement});
        this.loadTemplate("notes_new");
    });

    describe("#setup", function() {
        it("creates the correct Note", function() {
            expect(this.dialog.model.get("entityType")).toBe("workfile")
            expect(this.dialog.model.get("entityId")).toBe(1)
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        it("has the right title", function() {
            expect($(this.dialog.el).attr("title")).toBe(t("notes.new_dialog.title"));
        });
        it("renders the body", function(){
            this.dialog.model.set({body : "cats"})
            this.dialog.render();
            expect(this.dialog.$("textarea[name=body]").val()).toBe("cats")
        })
    });

    describe("submit", function() {
        beforeEach(function() {
            this.dialog.render();
            spyOn(this.dialog.model, "save");
            spyOn(this.dialog, "closeModal");
            this.dialog.$("textarea[name=body]").val("The body of a note");
            this.dialog.$("form").trigger("submit");
        });

        it("saves the data", function(){
            expect(this.dialog.model.get("body")).toBe("The body of a note")
            expect(this.dialog.model.save).toHaveBeenCalled();
        });
        it("closes the dialog box if saved successfully", function() {
            this.dialog.model.trigger("saved")
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });
        it("doesn't close the dialog box if it not saved successfully", function() {
            this.dialog.model.trigger("savedFailed")
            expect(this.dialog.closeModal).not.toHaveBeenCalled();
        });
    }); 
});