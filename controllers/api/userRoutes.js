const router = require('express').Router();
const { User, Post, Comment } = require('../../models');

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
       return res.json(users);
    } catch (err) {
        console.error(err);
        return res.status(404).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const users = await User.findOne({
            attributes: { exclude: ['password'] },
            where: { id: req.params.id },
            include: [
                { model: Post, attributes: ['id', 'title', 'content', 'created_at'] },
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'created_at'],
                    include: { model: Post, attributes: ['title'] }
                },
                { model: Post, attributes: ['title'] }
            ]
        });
        if (!users) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
        }
        return res.json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const users = await User.create({
            username: req.body.username,
            password: req.body.password
        });
        req.session.save(() => {
            req.session.user_id = users.id;
            req.session.username = users.username;
            req.session.loggedIn = true;
            return res.json(users);
        });
    } catch (err) {
        console.error(err);
        return res.status(404).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const users = await User.findOne({
            where: { username: req.body.username }
        });
        if (!users) {
            res.status(404).json({ message: 'Incorrect password or Username' });
            return;
        }
        const validPassword = await users.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(404).json({ message: 'Incorrect password or Username' });
            return;
        }
        req.session.save(() => {
            req.session.user_id = users.id;
            req.session.username = users.username;
            req.session.loggedIn = true;
            res.json({ user: users, message: 'logged in!' });
        });
    } catch (err) {
        console.error(err);
        return res.status(404).json(err);
    }
});

router.post('/logout', async (req, res) => {
    try {
        if (req.session.loggedIn) {
            req.session.destroy(() => {
             return res.status(200).end();
            });
        } else {
         return res.status(404).end();
        }
    } catch (err) {
        console.error(err);
        return res.status(404).json(err);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const users = await User.update(req.body, {
            individualHooks: true,
            where: { id: req.params.id }
        });
        if (!users[0]) {
            res.status(404).json({ message: 'No user found' });
            return;
        }
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(404).json(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const users = await User.destroy({
            where: { id: req.params.id }
        });
        if (!users) {
            res.status(404).json({ message: 'No user found' });
            return;
        }
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(404).json(err);
    }
});

module.exports = router;
