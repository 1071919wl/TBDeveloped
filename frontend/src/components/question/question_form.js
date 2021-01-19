import React from 'react'
import {Link} from 'react-router-dom'


class QuestionForm extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            subject: '',
            content: this.props.content,
            tag: this.props.tag,
            solved: this.props.solved,
            errors: this.props.errors,
            tagSelected: true
            
        }

        this.submit = this.submit.bind(this)
        this.updateSubmit = this.updateSubmit.bind(this)
        this.update = this.update.bind(this)

        
    }

    componentWillReceiveProps(nextProps) {

        this.setState({ errors: nextProps.errors })
    }

    update(field){
        return (e) => this.setState({[field]: e.currentTarget.value})
    }


    async submit(e){
        e.preventDefault();
        let newQuestion = {
            subject: this.state.subject,
            content: this.state.content,
            solved: this.state.solved,
            tag: this.state.tag,
            user: this.props.user
        };
        await this.props.processForm(newQuestion)
        // this.setState({subject: ""})
        // this.setState({content: ""})
        // this.setState({tagSelected: true})

        // this.props.fetchQuestions()

    }

    updateSubmit(e) {
        // console.log(this.props.questionId)
        e.preventDefault();
        let newQuestion = {
            
            content: this.state.content,
            solved: this.state.solved,
            tag: this.state.tag,
            user: this.props.user

        };
        this.props.processForm(this.props.questionId, newQuestion)
    }
    
    renderErrors() {
        return (
            <ul>
                {Object.keys(this.state.errors).map((error, i) => (
                    <li key={`error-${i}`}>
                        {this.state.errors[error]}
                    </li>
                ))}
            </ul>
        );
    }


    render(){
        if (this.props.formType === 'Update Question!'){
            return (
            <div className = "updateForm_container">

                <form onSubmit={this.updateSubmit}>
                        <h2 className="update_form_header">Edit Post</h2>
                    <div>
                    <label>
                        Content: <textarea type='text' value={this.state.content} onChange={this.update('content')} />
                    </label>
                    </div>
                    <div>
                    <label>Tag
                        <select onChange={this.update('tag')} >
                            <option value=''>--Choose a tag--</option>
                            <option value='idea'>Idea</option>
                            <option value='question'>Question</option>
                        </select>
                    </label>
                    </div>
                    <div>
                    <label>Solved
                        <select onChange={this.update('solved')} >
                            <option value=''>--Choose a tag--</option>
                            <option value='true'>True</option>
                            <option value='false'>False</option>
                        </select>
                    </label>
                    </div>
                    <label>
                        <button type='submit'>{this.props.formType}</button>
                    </label>

                </form>
            </div>

            )
        }
        return(
            <div className="createform_container">
                <form onSubmit={this.submit}>
                    <div>
                        <label>
                            Subject: <input className="question-subject" type="text" value={this.state.subject} onChange={this.update('subject')}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            Content: <textarea className="question-subject" value={this.state.content} onChange={this.update('content')}/>
                        </label>

                    </div>
                    <div>
                        <label>
                            <select onChange={this.update('tag')} >
                                <option value='' selected={this.state.tagSelected}>--Choose a tag--</option>
                                <option value='idea'>Idea</option>
                                <option value='question'>Question</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                                <button type='submit'>{this.props.formType}</button>
                                {this.renderErrors()}
                        </label>
                    </div>
                    


                </form>
            </div>
        )
    }
}

export default QuestionForm 