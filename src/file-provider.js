const fs = require('fs');
const path = require('path');


module.exports = class QnotlyFileProvider {
    constructor(extension_path) {
        this.__extension_path = extension_path;
    }

    load_template(template_name) {
        try {
            return fs.readFileSync(
                path.join(this.__extension_path, 'templates', template_name + '.html'), 'utf8'
            );
        } catch (err) {
            console.error(err);
            return '';
        }
    }
}
