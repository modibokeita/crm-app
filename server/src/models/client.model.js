import moongoose from 'mongoose'


const clientSchema = new moongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 254,
    },

    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        maxlength: 15,
    },

    address: {
        type: String,
        trim: true,
        maxlength: 200,     
    },
    companyName: {
        type: String,
        trim: true,
        maxlength: 100,
    }

})

const Client = moongoose.model("Client", clientSchema);

export default Client;