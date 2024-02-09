const router = require('express').Router();
const { Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', async (req, res) => {
    try {
        const comments = await Comment.findAll({});
        return res.json(comments);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where:{ id: req.params.id}
           });
        return res.json(comments);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.post('/', withAuth, async (req, res) => {
    try {
        if (req.session) {
            const comments = await Comment.create({
                comment_text: req.body.comment_text,
                post_id: req.body.post_id,
                user_id: req.session.user_id,
            });
            return res.json(comments);
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }
});

router.put('/:id', withAuth, async (req, res) => {
    try {
        const comments = await Comment.update(
            { comment_text: req.body.comment_text },
            { where: { id: req.params.id } }
        );
        if (!comments) {
            res.status(404).json({ message: 'No comment found' });
            return;
        }
        return res.json(comments);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.delete('/:id', withAuth, async (req, res) => {
    try {
        const comments = await Comment.destroy({
            where: { id: req.params.id }
        });
        if (!comments) {
            res.status(404).json({ message: 'No comment found' });
            return;
        }
       return res.json(comments);
    } catch (err) {
        console.error(err);
       return res.status(500).json(err);
    }
});

module.exports = router;
