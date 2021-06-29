if(process.env.NODE_ENV == 'production')
    module.exports = {URI: "mongodb+srv://Rafael:144000@cluster0.uvuke.mongodb.net/blog_node?retryWrites=true&w=majority"}
else
    module.exports = {URI: "mongodb://localhost/BlogNode"}