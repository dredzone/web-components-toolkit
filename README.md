# utility-toolkit
essential set of tools to develop components or applications


## model

### Purpose
- Provides API for interacting with state. Prevents direct access.
- Provides ability to subscribe to state changes.
- Provides ability to bind properties to other objects.

### Methods
-  defaultState() //returns object to use
-  get(accessor) //returns a copy of a slice of state
-  set(accessor, value) //sets a property
-  createSubscriber() //return a subscriber instance
-  createPropertyBinder(obj) //returns a propertyBinder instance

### Subscriber Methods
- on(accessor, callback) //registers a callback that will be fired when that state changes
- destroy() // unregisters all callbacks for this subscriber instance

### Property Binder Methods
- addBindings(bindings) //registers bindings
- destroy() // removes all bindings for this instance

Usage
```
import model from 'utility-toolkit/model';

class MyModel extends model() {
  get defaultState() {
    return {
      foo: {
        bar: [{baz:1}]
      }
    };
  }
}

const myModel = new MyModel();

//get a value
myModel.get('foo.bar.0.baz'); //1

//set a value
myModel.set('foo.bar.0.baz', 2);


//create a subscriber
const myModelSubscriber = myModel.createSubscriber();

//callback invoked on changes to "foo"
myModelSubscriber.on('foo', ()=>{});

//callback invoked on changes to "foo" and any of its descendents
myModelSubscriber.on('foo.*', ()=>{});

//don't forget to destroy your subscriber when you are done with it
myModelSubscriber.destroy();


//create a property binder
const obj = {
  toProp: 1
};
const myModelPropertyBinder = myModel
  .createPropertyBinder(obj)
  .addBindings(['foo', 'toProp']);

myModel.set('foo', 'new value for foo');
console.log(obj.toProp) // 'new value for foo'

//don't forget to destroy your property binder when you are done with it
myModelPropertyBinder.destroy();

```
