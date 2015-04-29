var React = require('react');
var t = require('tcomb-form');

class TForm extends React.Component {

    render () {
        var data = this.props.getData();
        if (!data.options) { data.options = {}; }
        if (!data.value) { data.value = {}; }
        return (<div className="TForm">
            <h1>User Settings</h1>
            <t.form.Form ref="form"
                type={data.model}
                options={data.options}
                value={data.value}
                onChange={this.formChange.bind(this)} />
        </div>);
    }

    formChange () {
        var value = this.refs.form.getValue();
        if (value != null) {
            this.props.onChange(value);
        } else {
            console.log("TODO validation");
        }
    }

}

module.exports = TForm;
