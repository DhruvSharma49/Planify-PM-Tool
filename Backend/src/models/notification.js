const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "task_assigned",
        "comment_added",
        "project_invite",
        "task_updated",
        "invite_accepted",
        "invite_rejected",
        "removed_from_project",
        "member_left",
        "general",
      ],
      default: "general",
    },

    link: {
      type: String,
      default: "",
    },

    meta: {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
      },

      projectTitle: {
        type: String,
        default: "",
      },

      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      role: {
        type: String,
        default: "member",
      },

      responded: {
        type: String,
        default: null,
      },
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 }
);

module.exports = mongoose.model("Notification", notificationSchema);