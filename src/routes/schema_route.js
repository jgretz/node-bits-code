export default class SchemaRoute {
  constructor(schema) {
    this.schema = schema;
  }

  get(req, res) {
    res({ call: 'get', schema });
  }

  put(req, res) {
    res({ call: 'put', schema });
  }

  post(req, res) {
    res({ call: 'post', schema });
  }

  delete(req, res) {
    res({ call: 'delete', schema });
  }
}
