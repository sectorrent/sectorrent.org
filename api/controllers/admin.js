const thread = require('../modules/thread');
const category = require('../modules/category');

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
    category.postCategory(req).then((data) => {
        res.json({
            status: 200,
            status_message: 'Insert was successful',
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

exports.putCategory = async (req, res) => {
    const id = (req.query.id) ? req.query.id : '';
    
    category.putCategory(req, id).then((data) => {
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

exports.deleteCategory = async (req, res) => {
    const id = (req.query.id) ? req.query.id : '';
    
    category.deleteCategory(req, id).then((data) => {
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
