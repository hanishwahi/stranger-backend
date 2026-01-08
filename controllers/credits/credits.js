const User = require('../../models/user');

exports.addCredits = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware
        const { credits } = req.body;

        if (!credits || credits <= 0) {
            return res.status(400).json({
                status: false,
                message: 'Credits must be greater than 0',
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { credits } },
            { new: true }
        ).select('username credits');

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: true,
            message: 'Credits added successfully',
            data: user,
        });
    } catch (error) {
        console.error('Add credits error:', error);
        res.status(500).json({
            status: false,
            message: 'Server error',
        });
    }
};
