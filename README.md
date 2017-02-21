# node-bits-code
node-bits-code allows you to use code to express your routes and schema. Rather than force you to use a DSL made up by a particular server or database package, this bit abstracts the concepts of routes and schema to their generic forms. This approach aims to keep your code clean and straight forward by reducing complexity and coupling, allowing you to focus on adding value not configuring your server.

## Install
```
npm install node-bits-code --save
```

or

```
yarn add node-bits-code
```

## Configuration
node-bits-code only has one configuration option - ```path``` and it is required. This property represents the root directory for the bit to search.

Here is an example of instantiating the bit:
```
nodeBits([
  nodeBitsCode({
    path: __dirname,
  }),
]);
```

## Routes
### Directory Structure
Inside the configured path, this bit will search for a directory named ```routes```. Any file found underneath routes is considered to be a route definition. The bit will match your directory structure for the resultant url.

For example, Using the folder structure ```routes/api/test.js``` will be map the default export to the url ```api/test```.

### Route Definition
node-bits-code understands three different structures for defining your routes. It allows multiple route definitions per file. The default export will be mapped to the file name and all named exports will be mapped to the name of the export. All functions will be passed a request reference and a result reference.

##### Function
If the export is a function, node-bits-code assumes that it is a GET and will map the function to that verb.

```
export default (req, res) => {
  res.json({ message: 'Alive' });
};
```

##### Object
If the export is a js object, node-bits-code will map GET to object.get, POST to object.post, PUT to object.put, and DELETE to object.delete.

```
export default {
  get: (req, res) => {
    res.json({ message: 'Alive' });
  },

  post: (req, res) => {
    // parse the body, then do something with it
    res.json({ data });
  },

  put: (req, res) => {
    // parse the body, then do something with it
    res.json({ data });
  },

  delete: (req, res) => {
    res.json({ deleted: true });
  }
};
```

##### Class
If the export is a ES6 class, node-bits-code will instantiate an instance of the object at boot and reference that instance for the lifetime of the process. It will map GET to object.get, POST to object.post, PUT to object.put, and DELETE to object.delete

```
export default class Test {
  get(req, res) {
    res.json({ message: 'Alive' });
  }

  post(req, res) {
    // parse the body, then do something with it
    res.json({ data });
  }

  put(req, res) {
    // parse the body, then do something with it
    res.json({ data });
  }

  delete(req, res) {
    res.json({ deleted: true });
  }
};
```

## Schema
node-bits-code enables the definition of the schema via json objects. In addition to being readable, this also allows you to source control the schema which is often very helpful. node-bits-code is intentionally agnostic about what database is eventually targeted; in general, you should be able to use the same schema definitions with and node-bit database bit (with the caveat that naturally there are differences in document databases vs relational databases, so there will be some features available for one and not the other).

node-bits-code accepts multiple definitions per file. The default export will be named the file name, and all named exports will retain their name.

### Models
Models are the objects to be stored in the database. node-bits-code expects these to be represented as js objects. The simplest objects are simply a list of properties and types. More complicated options are explained below.

```
export const address = {
  street: String,
  city: String,
  state: String,
  country: String,
  postal: String,
};
```

#### Column Definitions


#### Supported Types
The standard JS types are supported: ```String, Number, Date, Boolean```

In addition, you can import the following types from the node-bits package: ```INTEGER, DECIMAL, DOUBLE, FLOAT, UUID, STRING, PASSWORD, DATE, BOOLEAN, TEXT```

#### Nested Models

### Relationships

### Indexes

### Migrations

### Seeds
