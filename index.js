const { response } = require('express');
const path = require('path')
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Post = require('./src/posts/postsModel');
const Categories = require('./src/categories/categoriesModel');
const User = require('./src/users/usersModel');
const fileupload = require('express-fileupload');
const cors = require('cors');
//import fileupload from "express-fileupload";
//import cors from "cors";

app.use(
    fileupload({
        createParentPath: true,
    }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public')))

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
const mongoConnectionString = 'mongodb+srv://arqamsaleem:eovVOxEjQ5udxRYv@cluster0.tllcgcj.mongodb.net/reactCms?retryWrites=true&w=majority';
mongoose.connect( mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} );



app.get('/', function (req, res) {


});
app.get('/posts', function (req, res) {

    /**
     * Fetch Data
     */
    
    Post.aggregate( [
        {
          '$match': {}
        }
      ], (err, data) => {

        if (err) {
            res.sendStatus(403).statusMessage("Something wrong when fetching data!");
        }

        res.json(data);
    })
    

});
app.get('/posts/:slug', function (req, res) {

    /**
     * Fetch Data
     */
     Post.aggregate([
        {
          '$match': {
            'slug': req.params.slug
          }
        }, {
          '$addFields': {
            'arrayCategories': {
              '$map': {
                'input': '$categories', 
                'as': 'cat', 
                'in': {
                  '$toObjectId': [
                    '$$cat'
                  ]
                }
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'categories', 
            'localField': 'arrayCategories', 
            'foreignField': '_id', 
            'as': 'selected_cats'
          }
        }
      ], function(err, doc) {
            if (err) {
                res.sendStatus(403).statusMessage("Something wrong when fetching data!");
            }
            res.json(doc);
    });

});

app.post('/posts', function (req, res) {
    
    let featuredImage = null;
    const addNewPostObject = {
        slug:           req.body.slug,
        title:          req.body.title,
        url:            req.body.url,
        date:           req.body.date,
        author:         req.body.author,
        content:        req.body.content,
        status:         req.body.status,
        visibility:     req.body.visibility,
        //categories:     JSON.parse(req.body.categories),
        categories:     Object.values(JSON.parse(req.body.categories)),
    }
    
    if (req.files) {
        featuredImage = req.files.featuredImage;
        
        const today = new Date();
        featuredImage.mv(`public/media/${today.getFullYear()}/${today.getMonth()+1}/` + featuredImage.name);
        addNewPostObject.featuredImage =  {
            'name': featuredImage.name, 
            'url': `media/${today.getFullYear()}/${today.getMonth()+1}/` + featuredImage.name,
        }
    }

    /**
     * Insert Data
     */
    const data = new Post( addNewPostObject );
    
    data.save().then( (results) => {
        res.json(results);
    })
});

app.put(`/posts/:postID`, function (req, res) {

    //res.json(  req.body.categories);

    let featuredImage = null;
    let updatePostObject = {
        slug:           req.body.slug,
        title:          req.body.title,
        url:            req.body.url,
        date:           req.body.date,
        author:         req.body.author,
        content:        req.body.content,
        status:         req.body.status,
        visibility:     req.body.visibility,
        //categories:     JSON.parse(req.body.categories),
        categories:     Object.values(JSON.parse(req.body.categories)),
    }
    if (req.files) {
        featuredImage = req.files.featuredImage;

        const today = new Date();
        featuredImage.mv(`public/media/${today.getFullYear()}/${today.getMonth()+1}/` + featuredImage.name);

        updatePostObject.featuredImage = {
            'name': featuredImage.name, 
            'url': `media/${today.getFullYear()}/${today.getMonth()+1}/` + featuredImage.name,
        }
    }

    /**
     * Update Document
    */
    
    Post.findOneAndUpdate({ 
        _id: req.params.postID 
    }, 
    updatePostObject, 
     {
       new: true
     },
     (err, doc) => {
        if (err) {
            res.sendStatus(403).statusMessage("Something wrong when updating data!");
        }
    
        res.json(doc);
    });
});

app.delete(`/posts/:postID`, function (req, res) {

    /**
     * Delete Document
    */
    
    Post.findOneAndDelete({ 
        _id: req.params.postID 
    }, (err, doc) => {
        if (err) {
            res.sendStatus(403).statusMessage("Something wrong when deleting data!");
        }
    
        res.json(doc);
    });
});

/**
 * Routes for Categories
 */
app.get('/categories', ( req, res ) => {

    /**
     * Fetch Data
     */
    Categories.aggregate( [
        {
          '$match': {}
        }, {
          '$addFields': {
            'ObjectID': {
              '$toString': '$_id'
            }
          }
        }, {
          '$lookup': {
            'from': 'posts', 
            'localField': 'ObjectID', 
            'foreignField': 'categories', 
            'as': 'cats'
          }
        }
      ], ( err, data ) => {

        if ( err ) {
            res.sendStatus( 403 ).statusMessage( "Something wrong when fetching data!" );
        }

        res.json( data );
    } )

});
app.get('/categories/:slug', function ( req, res ) {

    /**
     * Fetch Data
     */
    Categories.findOne( { 'slug': req.params.slug }, function( err, doc ) {
        if (err) {
            res.sendStatus( 403 ).statusMessage( "Something wrong when fetching data!" );
        }
        res.json(doc);
    });

})
app.post('/categories', ( req, res ) => {

     /**
     * Insert Data
     */
      const data = new Categories({
        slug: req.body.slug,
        name: req.body.name,
        url: req.body.url,
        date: req.body.date,
        author: req.body.author,
        description: req.body.description,
        parent: req.body.parent,
    });

    data.save().then( ( results ) => {
        res.json( results );
    })
});
app.put(`/categories/:catID`, function ( req, res ) {

    /**
     * Update Document
    */
    
    Categories.findOneAndUpdate({ 
        _id: req.params.catID 
    }, 
    {
        slug: req.body.slug,
        name: req.body.name,
        url: req.body.url,
        date: req.body.date,
        author: req.body.author,
        description: req.body.description,
        parent: req.body.parent,
     }, 
     {
       new: true
     },
     ( err, doc ) => {
        if ( err ) {
            res.sendStatus( 403 ).statusMessage( "Something wrong when updating data!" );
        }
    
        res.json(doc);
    });
});
app.delete(`/categories/:catID`, function (req, res) {

    /**
     * Delete Document
    */
    
     Categories.findOneAndDelete({ 
        _id: req.params.catID 
    }, ( err, doc ) => {
        if ( err ) {
            res.sendStatus( 403 ).statusMessage( "Something wrong when deleting data!" );
        }
    
        res.json(doc);
    });
});

app.get(`/dashboard/stats`, function ( req, res ) {

    /**
     * Get stats to display on dashboard
    */
    let allStats = {
        categories: 0,
        posts: 0,
    }
    let haveCounts = false;

    Categories.countDocuments( {}, ( err, count ) => {
        if ( err ) {
            res.sendStatus( 403 ).statusMessage( "Something wrong!" );
        }
        allStats.categories = count;
        haveCounts = true;
    });
    Post.countDocuments( {}, ( err, count ) => {
        if ( err ) {
            res.sendStatus( 403 ).statusMessage( "Something wrong!" );
        }
        allStats.posts = count;
        haveCounts = true;
        res.json( allStats );
    });

});

/**
 * Routes related to Users Model
 */
app.post(`/signup`, ( req, res ) => {
    /**
     * Insert Data
     */
    const data = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.username,
        email:  req.body.email,
        date: req.body.date,
        passwrod: req.body.password,
    });

    data.save().then( ( results ) => {
        res.json( results );
    })
});

app.listen( 4000, () => console.log('listening on port 4000...') );