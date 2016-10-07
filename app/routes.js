var User = require('./models/user');

module.exports = function(app, passport) {


	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('mark', {
			user : req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

		app.get('/login', function(req, res) {
			res.render('login', { message: req.flash('loginMessage') });
		});


		app.post('/chat', function(req, res){
			res.redirect('profile');
		})

		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile',
			failureRedirect : '/login',
			failureFlash : true
		}));


		app.get('/signup', function(req, res) {
			res.render('signup', { message: req.flash('loginMessage') });
		});


		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile',
			failureRedirect : '/signup',
			failureFlash : true
		}));

		app.post('/savedrawing', function(req, res) {
			var user = req.user._id;
			var drawing = req.body;
			console.log(user);
			User.findOneAndUpdate({'_id': user}, {'saveDrawing':drawing})
						// execute the above query
						.exec(function(err, doc){
							// log any errors
							if (err){
								console.log(err);
							} else {
			          console.log('success');
							}
					})
				})

		app.get('/loadDrawing', function(req, res){
			var user = req.user._id;
			var query = User.findOne({ '_id': user })
				.exec(function(err, doc){
					// log any errors
					if (err){
						console.log(err);
					} else {
						res.json(doc.saveDrawing);
					}
			})
		})


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
	}
}
