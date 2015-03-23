var express = require('express'),
    yaml = require('js-yaml'),
    fs = require('fs');

module.exports = function(config) {

var router = express.Router();

router.use('/new/:us/:project', function(req, res) {
    // TODO permissions
    var file = config.get('user_files')+'/'+req.user+'/'+req.params.project+req.path;
    if (fs.existsSync(file)) {
        res.send({ ok: false, error: 'File already exists' });
    } else {
        fs.writeFileSync(file,'');

        var projfile = config.get('user_files')+'/'+req.user+'/projects.yml';
        projects = yaml.safeLoad(fs.readFileSync(projfile));
        // TODO files in subdirs
        projects[req.params.project].files[req.path.substr(1)] = { type: 'javascript' };
        fs.writeFileSync(projfile, yaml.safeDump(projects));
        res.send({ ok: true, files: projects[req.params.project].files });
    }
});

router.use('/delete/:us/:project', function(req, res) {
    // TODO permissions
    var file = config.get('user_files')+'/'+req.user+'/'+req.params.project+req.path;
    if (!fs.existsSync(file)) {
        res.send({ ok: false, error: 'File does not exist' });
    } else {
        fs.unlinkSync(file);

        var projfile = config.get('user_files')+'/'+req.user+'/projects.yml';
        projects = yaml.safeLoad(fs.readFileSync(projfile));
        // TODO files in subdirs
        delete projects[req.params.project].files[req.path.substr(1)];
        fs.writeFileSync(projfile, yaml.safeDump(projects));
        res.send({ ok: true, files: projects[req.params.project].files });
    }
});

return router;

};
