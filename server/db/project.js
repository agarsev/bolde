var db = require('../db').query;
var file = require('./file');

function decode (doc) {
    return {
        name: doc.name,
        user: doc.owner,
        desc: doc.desc,
        shared: doc.shared || [],
        public: doc.public || false
    };
}

function template (owner, name) {
    return { _type: 'project', owner, name };
}

exports.new = function (user, project, desc) {
    var doc = {
        _type: 'project',
        owner: user,
        name: project,
        desc,
        shared: [],
        public: false
    };
    return db.insert(doc);
};

exports.setdesc = function (user, project, desc) {
    var match = template(user, project);
    return db.update(match, {$set: {desc}});
};

exports.remove = function (user, project) {
    var match = {
        _type: 'project',
        owner: user,
    };
    if (project !== undefined) {
        match.name = project;
    }
    return db.remove(match)
    .then(() => file.remove(user, project));
};

exports.get = function (user, project) {
    var match = template(user, project);
    return db.findOne(match).then(decode);
};

exports.copy = function (user1, project1, user2, project2) {
    return exports.get(user1, project1)
    .then(project => exports.new(user2, project2, project.desc))
    .then(() => file.all(user1, project1))
    .then(files => Promise.all(files.map(f =>
            file.new(user2, project2, f.path, f.type))));
};

exports.all = function (user) {
    var own = {
        _type: 'project',
        owner: user
    };
    var shared = {
        _type: 'project',
        $not: { owner: user },
        shared: user
    };
    var publics = {
        _type: 'project',
        public: true,
        $and: [
            {$not: { owner: user }},
            {$not: { shared: { $elemMatch: user }}}
        ]
    };
    return Promise.all([db.findAll(own), db.findAll(shared), db.findAll(publics)])
    .then(ps => {
        return {
            own: ps[0].map(decode),
            shared: ps[1].map(decode),
            public: ps[2].map(decode)
        };
    });
};

exports.updateshare = function (user, project, shared) {
    var match = template(user, project);
    return db.update(match, {$set: {shared}});
};

exports.allmembers = function (user, project) {
    var match = template(user, project);
    return db.findOne(match, {shared: 1})
    .then(p => [user].concat(p.shared));
};

exports.backup = function (user, project) {
    var proj;
    return exports.get(user, project)
    .then(p => {
        proj = { desc: p.desc };
        return file.all(user, project);
    }).then(files =>
        [proj].concat(files.map(f => {
            return { path: f.path, type: f.type };
        }))
    );
};

exports.restore = function (user, project, docs) {
    var proj = docs.shift();
    return exports.new(user, project, proj.desc)
    .then(() => Promise.all(docs.map(f =>
        file.new(user, project, f.path, f.type))));
};

exports.setpublic = function (user, project, is_public) {
    var match = template(user, project);
    return db.update(match, {$set: {public:is_public}});
};
