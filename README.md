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

### Database Access
Often you will need access to the database as you implement your route. node-bits-code can pass you the database defined during the initializeDatabase step - simply expose a method on your route named registerDatabase.

```
export default class Test {
  registerDatabase(db) {
    this.db = db;
  }

  get(req, res) {
    this.db.find({ id: 1})
      .then((result) => res.json(result));
  }
}
```

### Custom Route Definition
Occasionally the convention of the folder structure is insufficient to represent the desired route. If you find your self in this situation, you can implement the getRoute method in your route and return the required route address.

```
import { GET } from 'node-bits';

export default class Test {
  getRoute(verb) {
    if (verb === GET) {
      return '/api/test/all';
    }

    return null; // will use the folder structure for all other verbs
  }

  get(req, res) {
    res.json([]);
  }
}
```

### Request Validation
The schema for the body of a request can be specified with JSON Schema using the [ajv package](https://www.npmjs.com/package/ajv).  By implementing a requestSchema method you can specifiy the properties that your request accepts and which ones it requires.  Any request that does not match the schema will be rejected with a 400 error before reaching your handler.  By default it will also filter out any unknown properties.  If you need to accept unknown properties, add `addtitionalPropertes: true` to your schema.

```
import { POST } from 'node-bits';

export default class Test {
  requestSchema(verb) {
    if (verb === POST) {
      return {
        properties: {
          email: {type: 'string', format: 'email'}, // email is a string that must be in email format
          count: {type: 'number', mininum: 0}       // count is a number with a minimum value of 0
        },
        required: ['email']  // Only email is required, count is not
      }
    }

    return null; // All other methods will do no request validation
  }

  post(req, res) {
    // res.body.email will be a valid email address
    // res.body.count will either be undefined or a number >= 0
    // res.body will have no other properties
    res.json([]);
  }
}
```


## Schema
node-bits-code enables the definition of the schema via json objects. In addition to being readable, this also allows you to source control the schema which is often very helpful. node-bits-code is intentionally agnostic about what database is eventually targeted; in general, you should be able to use the same schema definitions with and node-bit database bit (with the caveat that naturally there are differences in document databases vs relational databases, so there will be some features available for one and not the other).

node-bits-code accepts multiple definitions per file. The default export will be named the file name, and all named exports will retain their name.

node-bits-code will by convention search for a directory named ```schema``` and process the files underneath.

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
##### Simple
The simplest form of defining a column is simples specifying its type: ``` street: String ```. The column will be assumed to be nullable.

##### Complex
If you need more, you can specify an object as the value for the column. Supported properties vary by implementation, so see the database provider you are using for details.

```
street: { type: String, allowNull: false, }
balance: { type: DECIMAL, allowNull: false, precision: 10, scale: 2 }
```

#### Supported Types
The standard JS types are supported: ```String, Number, Date, Boolean```

In addition, you can import the following types from the node-bits package: ```INTEGER, DECIMAL, DOUBLE, FLOAT, UUID, STRING, PASSWORD, DATE, BOOLEAN, TEXT```

### Relationships
Relationships are only known to be supported currently by node-bits-sql. To define a relationship, you need to define the model, the reference, and the type.

```
import { MANY_TO_ONE } from 'node-bits';

export const order_customer = {
  model: 'order',
  references: 'customer',
  type: MANY_TO_ONE,
}
```

By specifying relationship, the database bit will create the implied columns and foreign keys. Please see the [node-bits-sql documentation](https://github.com/jgretz/node-bits-sql) for further details.

#### Nested Models
For many models, representing their children via nesting provides a nice visual cue. All current database bits support this syntax.

```
export const order = {
  total: Number,
  lines: [{
    itemId: Number,
    quantity: Number,
  }],
};
```

### Indexes
Properly indexing your database can greatly improve access time. All current database bits support this feature. To define an index, you need to specify the model, the fields, and the direction.

```
export const orderlines_item_index = {
  model: 'orderlines',
  fields: [{ field: 'itemId', desc: true }],
};
```

### Migrations
Migrations are currently only supported by the node-bits-sql bit. By convention they are located in a migrations folder, and are ordered following semantic versioning.

Please see the [node-bits-sql documentation](https://github.com/jgretz/node-bits-sql) for further details.

### Seeds
Seeding a database with starter content is helpful both during development cycles and the rollout of the production system. All current database bits support seeding. The bits will add a seed model to your set which will keep track of only running a seed 1x.

Seeds are kept by convention in the ```schema/seeds``` directory. Models are matched to the data via the file name. Data is represented in JSON form.

##### Orders Example
File: ```schema/seeds/order.js```

Content:
```
export default [
  {
    id: 1,
    total: '5.00',
  },
  {
    id: 2,
    total: '15.00',
  },
];
```

File: ```schema/seeds/orderlines.js```

Content:
```
export default [
  {
    orderId: 1,
    itemId: 1,
    quantity: 2,
  },
  {
    orderId: 2,
    itemId: 3,
    quantity: 3,
  },
];
```
