import is from '../lib/type.js';

describe('Type', () => {
  describe('arguments', () => {
    it('should return true if passed parameter type is arguments', () => {
      let getArguments = function() {
        return arguments;
      };
      let args = getArguments('test');
      expect(is.arguments(args)).to.be.true;
    });
    it('should return false if passed parameter type is not arguments', () => {
      const notArgs = ['test'];
      expect(is.arguments(notArgs)).to.be.false;
    });
    it('should return true if passed all parameters arguments', () => {
      let getArguments = function() {
        return arguments;
      };
      let args = getArguments('test');
      expect(is.arguments.all(args, args, args)).to.be.true;
    });
    it('should return true if passed any parameters arguments', () => {
      let getArguments = function() {
        return arguments;
      };
      let args = getArguments('test');
      expect(is.arguments.any(args, 'test', 'test2')).to.be.true;
    });
  });

  describe('array', () => {
    it('should return true if passed parameter type is array', () => {
      let array = ['test'];
      expect(is.array(array)).to.be.true;
    });
    it('should return false if passed parameter type is not array', () => {
      let notArray = 'test';
      expect(is.array(notArray)).to.be.false;
    });
    it('should return true if passed parameters all array', () => {
      expect(is.array.all(['test1'], ['test2'], ['test3'])).to.be.true;
    });
    it('should return true if passed parameters any array', () => {
      expect(is.array.any(['test1'], 'test2', 'test3')).to.be.true;
    });
  });

  describe('boolean', () => {
    it('should return true if passed parameter type is boolean', () => {
      let bool = true;
      expect(is.boolean(bool)).to.be.true;
    });
    it('should return false if passed parameter type is not boolean', () => {
      let notBool = 'test';
      expect(is.boolean(notBool)).to.be.false;
    });
  });

  describe('error', () => {
    it('should return true if passed parameter type is error', () => {
      let error = new Error();
      expect(is.error(error)).to.be.true;
    });
    it('should return false if passed parameter type is not error', () => {
      let notError = 'test';
      expect(is.error(notError)).to.be.false;
    });
  });

  describe('function', () => {
    it('should return true if passed parameter type is function', () => {
      expect(is.function(is.function)).to.be.true;
    });
    it('should return false if passed parameter type is not function', () => {
      let notFunction = 'test';
      expect(is.function(notFunction)).to.be.false;
    });
  });

  describe('null', () => {
    it('should return true if passed parameter type is null', () => {
      expect(is.null(null)).to.be.true;
    });
    it('should return false if passed parameter type is not null', () => {
      let notNull = 'test';
      expect(is.null(notNull)).to.be.false;
    });
  });

  describe('number', () => {
    it('should return true if passed parameter type is number', () => {
      expect(is.number(1)).to.be.true;
    });
    it('should return false if passed parameter type is not number', () => {
      let notNumber = 'test';
      expect(is.number(notNumber)).to.be.false;
    });
  });

  describe('object', () => {
    it('should return true if passed parameter type is object', () => {
      expect(is.object({})).to.be.true;
    });
    it('should return false if passed parameter type is not object', () => {
      let notObject = 'test';
      expect(is.object(notObject)).to.be.false;
    });
  });

  describe('regexp', () => {
    it('should return true if passed parameter type is regexp', () => {
      let regexp = new RegExp();
      expect(is.regexp(regexp)).to.be.true;
    });
    it('should return false if passed parameter type is not regexp', () => {
      let notRegexp = 'test';
      expect(is.regexp(notRegexp)).to.be.false;
    });
  });

  describe('string', () => {
    it('should return true if passed parameter type is string', () => {
      expect(is.string('test')).to.be.true;
    });
    it('should return false if passed parameter type is not string', () => {
      expect(is.string(1)).to.be.false;
    });
  });

  describe('undefined', () => {
    it('should return true if passed parameter type is undefined', () => {
      expect(is.undefined(undefined)).to.be.true;
    });
    it('should return false if passed parameter type is not undefined', () => {
      expect(is.undefined(null)).to.be.false;
      expect(is.undefined('test')).to.be.false;
    });
  });

  describe('map', () => {
    it('should return true if passed parameter type is Map', () => {
      expect(is.map(new Map())).to.be.true;
    });
    it('should return false if passed parameter type is not Map', () => {
      expect(is.map(null)).to.be.false;
      expect(is.map(Object.create(null))).to.be.false;
    });
  });

  describe('set', () => {
    it('should return true if passed parameter type is Set', () => {
      expect(is.set(new Set())).to.be.true;
    });
    it('should return false if passed parameter type is not Set', () => {
      expect(is.set(null)).to.be.false;
      expect(is.set(Object.create(null))).to.be.false;
    });
  });
});
