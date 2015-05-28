var React = require('react');
var t = require('tcomb-form');

class TForm extends React.Component {

    render () {
        var data = this.props.getData();
        if (!data.options) { data.options = {}; }
        if (!data.value) { data.value = {}; }
        return (<div className="TForm">
            {this.props.title?<h1>{this.props.title}</h1>:null}
            <t.form.Form ref="form"
                type={data.model}
                options={data.options}
                value={data.value}
                onChange={this.formChange.bind(this)} />
        </div>);
    }

    formChange () {
        if (this.props.onChange===undefined) { return; }
        var value = this.refs.form.getValue();
        if (value != null) {
            this.props.onChange(value);
        } else {
            console.log("TODO validation");
        }
    }

    getValue () {
        return this.refs.form.getValue();
    }

}

module.exports = TForm;
