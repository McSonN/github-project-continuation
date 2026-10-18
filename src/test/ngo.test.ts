import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), select: vi.fn(), order: vi.fn(), eq: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: mocks }));
import { filterNgoNames, loadNgoAccess } from "@/lib/ngo";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ order: mocks.order });
});
describe("NGO access", () => {
  it("scopes the ordinary user's profile to their own latest organization", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    mocks.order.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockResolvedValue({ data: [{ organization: "Moje NGO" }, { organization: "Poprzednie NGO" }], error: null });
    expect(await loadNgoAccess("owner-1")).toEqual({ isAdmin: false, names: ["Moje NGO"] });
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "owner-1");
  });
  it("lists unique organizations for administrators", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    mocks.order.mockResolvedValue({ data: [{ organization: "NGO B" }, { organization: "NGO A" }, { organization: "NGO B" }], error: null });
    expect(await loadNgoAccess("admin-1")).toEqual({ isAdmin: true, names: ["NGO A", "NGO B"] });
    expect(mocks.eq).not.toHaveBeenCalled();
  });
  it("searches organizations ignoring case and surrounding whitespace", () => {
    expect(filterNgoNames(["Fundacja Pomoc", "NGO Sport"], " POMOC ")).toEqual(["Fundacja Pomoc"]);
  });
  it("does not return organizations if the role check fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error("Denied") });
    await expect(loadNgoAccess("owner-1")).rejects.toThrow("Denied");
    expect(mocks.from).not.toHaveBeenCalled();
  });
});