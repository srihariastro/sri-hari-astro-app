import * as actionTypes from '../actionTypes';

const initialState = {
    isLoading: false,
    isRefreshing: false,
    imagePickerVisible: false,
    // call_status: 'online',
    // chat_status: 'online',
    // video_call_status: 'online',

};

const setting = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case actionTypes.SET_IS_LOADING:
            return {
                ...state,
                isLoading: payload,
            };
        case actionTypes.SET_IS_REFRESHING:
            return {
                ...state,
                isRefreshing: payload,
            };
        case actionTypes.SET_IMAGE_PICKER_VISIBLE:
            return {
                ...state,
                imagePickerVisible: payload,
            };
        // case actionTypes.UPDATE_CALL_STATUS:
        //     return {
        //         ...state,
        //         call_status: payload,
        //     };
        // case actionTypes.UPDATE_CHAT_STATUS:
        //     return {
        //         ...state,
        //         chat_status: payload,
        //     };
        // case actionTypes.UPDATE_VIDEO_CALL_STATUS:
        //     return {
        //         ...state,
        //         video_call_status: payload,
        //     };
        default:
            return state;
    }
};

export default setting;