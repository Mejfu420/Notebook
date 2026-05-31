/// <reference types="jest" />
import { requireApiAuth } from '../../../middlewares/requireAuth';
import { getAuth } from '@clerk/express';

jest.mock('@clerk/express', () => ({
    getAuth: jest.fn(),
}));

describe('Require Auth Middleware (Unit)', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    it('should call next() if userId is present', () => {
        jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

        requireApiAuth(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if userId is missing', () => {
        jest.mocked(getAuth).mockReturnValue({ userId: null } as any);

        requireApiAuth(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
});