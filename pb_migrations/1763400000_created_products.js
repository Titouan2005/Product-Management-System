/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = new Collection({
      type: "base",
      name: "products",
      // Only the superuser (used by the Next.js API routes) can read or change records
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { type: "text", name: "brand", required: true },
        { type: "text", name: "model", required: true },
        { type: "text", name: "price", required: true },
        { type: "text", name: "description", required: true },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
    });

    app.save(collection);
  },
  (app) => {
    // Rollback: remove the collection
    const collection = app.findCollectionByNameOrId("products");
    app.delete(collection);
  }
);
