import {connect} from 'react-redux';
import {receiveResponse} from '../../actions/responses_actions';
import AnswerIndex from '../answer/answer_index';
import {postChat} from '../../actions/messages_actions';

    //! 1/17 WL
    import {fetchChat} from '../../actions/messages_actions';
    //! 1/17 WL

const mapStateToProps = (state, ownProps) => {
    
    return({
    questionID: ownProps.questionID,
    responses: ownProps.responses,
    username: ownProps.username,
    posterID: ownProps.currentUserID,
    })
}

const mapDispatchToProps = (dispatch) => ({
    fetchAnswers: (responses) => dispatch(receiveResponse(responses)),
    createChat: (newChat) => dispatch(postChat(newChat)),
    //! 1/17 WL
    chatID: (chatID) => dispatch(fetchChat(chatID))
    //! 1/17 WL
})

export default connect(mapStateToProps, mapDispatchToProps)(AnswerIndex)

