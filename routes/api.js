
/*
 * GET about page.
 */

exports.about = function(req, res){
  res.render('about', { title: 'Scheduler | About' });
};