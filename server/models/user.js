const mongoose = require ("mongoose");
const validator = require ("validator");
const jwt = require ("jsonwebtoken");
const bcrypt = require ("bcrypt");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type : String,
            required : true,
            trim: true
        },

        lastName: {
            type: String,
            trim: true
        },

        emailId: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            validate(value){
                if(!validator.isEmail(value)) {
                    throw new Error ("Enter a valid Email Address :(");
                }
            }
        },

        password: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error ("Enter a strong password :(");
                }
            }
        },

        //trying to include role based access control (rbac)
        //roles are admin, editor and viewer

        role: {
            type: String,
            enum: {
                values: ["admin", "editor", "viewer"],
                message: `{value} is not a valid access role`,
            },
            default: "viewer",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    const user = this;

    if (!user.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({_id: user._id, }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};

module.exports = mongoose.model("user", userSchema);