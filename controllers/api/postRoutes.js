const router = require('express').Router();
const { Post, User, Comment } = require('../../models');
const sequelize = require('../../config/connection');
const withAuth = require('../../utils/auth');

router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            attributes: ['id', 'title', 'content', 'created_at'],
            order: [['created_at', 'ASC']],
            include: [
                { model: User, attributes: ['username'] },
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                    include: { model: User, attributes: ['username'] }
                }
            ]
        });
        return res.json(posts);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const posts = await Post.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'content', 'title', 'created_at'],
            include: [
                { model: User, attributes: ['username'] },
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                    include: { model: User, attributes: ['username'] }
                }
            ]
        });
        if (!posts) {
            res.status(404).json({ message: 'No post found' });
            return;
        }
        return res.json(posts);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.post('/', withAuth, async (req, res) => {
    try {
        const posts = await Post.create({
            title: req.body.title,
            content: req.body.content,
            user_id: req.session.user_id
        });
        return res.json(posts);
    } catch (err) {
        console.error(err);
       return res.status(500).json(err);
    }
});

router.put('/:id', withAuth, async (req, res) => {
    try {
        const posts = await Post.update(
            { title: req.body.title, content: req.body.content },
            { where: { id: req.params.id } }
        );
        if (!posts[0]) {
            res.status(404).json({ message: 'No post found' });
            return;
        }
       return res.json(posts);
    } catch (err) {
        console.error(err);
       return res.status(500).json(err);
    }
});

router.delete('/:id', withAuth, async (req, res) => {
    try {
        const posts = await Post.destroy({
            where: { id: req.params.id }
        });
        if (!posts) {
            res.status(404).json({ message: 'No post found' });
            return;
        }
       return res.json(posts);
    } catch (err) {
        console.error(err);
       return res.status(500).json(err);
    }
});

module.exports = router;
