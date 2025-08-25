const express = require('express');
const router = express.Router();
const settingsController = require('../Controllers/settingsController');
const { protect } = require('../MiddleWares/authMiddleware');
const { validateSettings } = require('../MiddleWares/validateSettings');
const { validateRequest } = require('../MiddleWares/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User settings management
 */

/**
 * @swagger
 * /settings/{username}:
 *   get:
 *     summary: Get settings by username
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username to retrieve settings for
 *         schema:
 *           type: string
 *           example: johndoe
 *     responses:
 *       200:
 *         description: User settings object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Settings not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:username', protect, settingsController.getSettingsByUsername);

/**
 * @swagger
 * /settings/{username}:
 *   put:
 *     summary: Update settings by username
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username to update settings for
 *         schema:
 *           type: string
 *           example: johndoe
 *     requestBody:
 *       description: Settings data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SettingsUpdate'
 *     responses:
 *       200:
 *         description: Updated user settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Settings not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:username', protect, validateSettings, validateRequest, settingsController.updateSettings);

module.exports = router;

