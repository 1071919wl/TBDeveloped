import React from 'react';
import CreateQuestionFormContainer from '../question/create_question_form_container'
import {Link} from 'react-router-dom'



class Profile extends React.Component {
    // constructor(props) {
    //     super(props);
    // }


    componentDidMount() {
        this.props.fetchProfileQuestions(this.props.currentUser.questions)
    }

    

    render() {
        console.log('this.props.currenUser.id', this.props.currentUser.id)
        const profile_questions = () => {
            if(this.props.profile_questions.length > 0){
                return(
                this.props.profile_questions.map((question, id) => {
                    if(question.user === this.props.currentUser.id){
                        return(
                            //!MAPING AND RENDERING ONE OF THESE DIVS WHEN QUESTION ID !== CURENT USER
                            <div key={id}>
                                Question Asked:
                                
                                <Link to={`/question/${question._id}`}>
                                    {question.subject}
                                </Link>
                                
                                <div>
                                    {question.user}
                                </div>
                            </div>
                        )
                    }else{
                        return (
                            //!MAPING AND RENDERING ONE OF THESE DIVS WHEN QUESTION ID !== CURENT USER
                            <div key={id} >
                                Question Answered:
                                <div>
                                    <Link to={`/question/${question._id}`}>
                                        {question.subject}
                                    </Link>
                                </div>
                                <div>
                                    {question.content}
                                </div>
                            </div>
                        )
                    }
                })
                )
                // console.log(this.props.profile_questions)
            }
        }
        
        return(
        <div>
            <h2>{this.props.currentUser.username}'s Profile</h2>

            <div>
                {profile_questions()}
            </div>

            <div>
                <CreateQuestionFormContainer />
            </div>
        </div>
        )
    }
}

export default Profile;