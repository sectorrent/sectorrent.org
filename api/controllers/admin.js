const thread = require('../modules/thread');

exports.putThreadPin = async (req, res) => {
    const id = (req.query.id) ? req.query.id : '';
    
    thread.putThreadPin(req, id).then((data) => {
        res.json({
            status: 200,
            status_message: 'Update was successful',
            data
        });

    }).catch(function(error){
        res.json({
            status: 400,
            status_message: error.message
        });
        res.end();
    });
};

exports.deleteThreadPin = async (req, res) => {
    const id = (req.query.id) ? req.query.id : '';
    
    thread.deleteThreadPin(req, id).then((data) => {
        res.json({
            status: 200,
            status_message: 'Delete was successful',
            data
        });

    }).catch(function(error){
        res.json({
            status: 400,
            status_message: error.message
        });
        res.end();
    });
};

exports.postCategory = async (req, res) => {
    /*
    thread.postCategory(req).then((data) => {
        res.json({
            status: 200,
            status_message: 'Delete was successful',
            data
        });

    }).catch(function(error){
        res.json({
            status: 400,
            status_message: error.message
        });
        res.end();
    });
    */
};

exports.putCategory = async (req, res) => {
    const id = (req.query.id) ? req.query.id : '';
    /*
    thread.putCategory(req, id).then((data) => {
        res.json({
            status: 200,
            status_message: 'Delete was successful',
            data
        });

    }).catch(function(error){
        res.json({
            status: 400,
            status_message: error.message
        });
        res.end();
    });
    */
};

exports.deleteCategory = async (req, res) => {
    const id = (req.query.id) ? req.query.id : '';
    
    /*
    thread.deleteCategory(req, id).then((data) => {
        res.json({
            status: 200,
            status_message: 'Delete was successful',
            data
        });

    }).catch(function(error){
        res.json({
            status: 400,
            status_message: error.message
        });
        res.end();
    });
    */
};
