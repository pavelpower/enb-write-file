var mockFS = require('mock-fs'),
    MockNode = require('mock-enb/lib/mock-node'),
    WriteFileTechs = require('../../techs/write-file');

describe('techs/write-file', function () {
    var bundle,
        resolveSpy,
        rejectSpy;

    beforeEach(function () {
        mockFS({
            bundle: {
                'file.txt': 'I\'m here'
            }
        });

        bundle = new MockNode('bundle');
        resolveSpy = sinon.spy(bundle, 'resolveTarget');
        rejectSpy = sinon.spy(bundle, 'rejectTarget');
    });

    afterEach(function () {
        mockFS.restore();
    });

    it('should create target file', function () {
        return bundle.runTech(WriteFileTechs, {
            target: 'file.txt',
                content: 'I\'m here'
            })
            .should.be.fulfilled
            .then(function () {
                resolveSpy.should.calledWith('file.txt');
            });
    });

    it('should prodive file to target', function () {
        return bundle.runTech(WriteFileTechs, { target: 'file.txt' })
            .should.be.fulfilled
            .then(function () {
                resolveSpy.should.calledWith('file.txt');
            });
    });

    it('should reject target if file is not found', function () {
        return bundle.runTech(WriteFileTechs, { target: 'non-existent.txt' })
            .should.be.rejectedWith('file not found')
            .then(function () {
                rejectSpy.should.calledWith('non-existent.txt');
            });
    });
});