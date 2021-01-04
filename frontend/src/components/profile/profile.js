import React from 'react';
// import CreateQuestionFormContainer from '../question/create_question_form_container'
import {Link} from 'react-router-dom'
import '../../assets/stylesheets/profile.scss';


class Profile extends React.Component {
    // constructor(props) {
    //     super(props);
    // }


    componentDidMount() {
        // console.log(this.props.currentUser.questions)
        this.props.fetchProfileQuestions(this.props.currentUser.questions)
    }

    

    render() {
        let amtOfPost = 0
        const profile_questions = () => {

            if(this.props.profile_questions.length > 0){
                return(
                    this.props.profile_questions.map((question, id) => {
                        if(this.props.currentUser.questions.includes(question._id)){
                            // console.log('jjello', this.props.currentUser);
                            if(question.user._id === this.props.currentUser.id){
                                // console.log('bellow', (question.user._id));
                                amtOfPost += 1;
                                return(
                                    <div key={id} className='questions_topic'>
                                        <div className='individual_case'>
                                            <label>
                                                <div className='sub_label'>Case Id:</div>
                                                <Link to={`/question/${question._id}`}>
                                                <div className='actual_info'>{question._id}</div>
                                                </Link>
                                            </label>
                                            <label>
                                                <div className='sub_label'>Subject:</div>
                                                <div className='actual_info'>{question.subject}</div>
                                            </label>
                                            <label>
                                                <div className='sub_label'>Case Closed: </div>
                                                <div className='actual_info'>{`${question.solved}`}</div>
                                            </label>
                                        </div>
                                        
                                    </div>
                                )
                            }
                            //! USERS ANSWERED/RESPONDED POSTS. REVISIT AFTER COHORT. SHOULD BE A SEPARATE IF STATEMENT
                            // else{
                            //     return (
                            //         <div key={id}>
                            //             <div className="post_answered_title">Posts Answered:</div>
                            //             <div>SUBJECT:
                            //                 <Link to={`/question/${question._id}`}>
                            //                     {question.subject}
                            //                 </Link>
                            //             </div>
                            //             <div>CONTENT: 
                            //                 {question.content}
                            //             </div>
                            //         </div>
                            //     )
                            // }
                        }
                        
                    })
                )
                // console.log(this.props.profile_questions)
            }
        }
        console.log('currentUserId', this.props.currentUser.id)
        return(
            <div className='profile_container'>
                
                <div className="created_post_info">
                    <div className="created_post_title">Created Posts:</div>
                    {profile_questions()}
                </div>

                <div className="user_profile_info">
                    <div className='profile_name'>{this.props.currentUser.username}'s Profile</div>

                    <img alt="robots" src={`https://robohash.org/${this.props.currentUser.id}?100x100`} className='roboImgApi'/>

                    <div className='profile_post_amt'>Number of Posts: {amtOfPost}</div>
                    <div className='profile_reponse_amt'>Response to Posts: 0</div>
                </div>

            </div>
            
        )
    }
}

export default Profile;