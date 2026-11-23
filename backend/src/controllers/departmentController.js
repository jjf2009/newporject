const departmentService = require("../services/departmentService");

async function list(req, res, next) { try { res.json({ success: true, data: await departmentService.listDepartments() }); } catch (error) { next(error); } }
async function create(req, res, next) { try { res.status(201).json({ success: true, data: await departmentService.createDepartment(req.body) }); } catch (error) { if (error.code === 11000) return res.status(409).json({ success: false, message: "Department code or name already exists." }); next(error); } }
async function update(req, res, next) { try { const data = await departmentService.updateDepartment(req.params.id, req.body); if (!data) return res.status(404).json({ success: false, message: "Department not found" }); res.json({ success: true, data }); } catch (error) { if (error.code === 11000) return res.status(409).json({ success: false, message: "Department code or name already exists." }); next(error); } }
async function remove(req, res, next) { try { res.json({ success: true, ...(await departmentService.deleteDepartment(req.params.id)) }); } catch (error) { next(error); } }

module.exports = { list, create, update, remove };
