import OverviewPageDesktop from "./components/overview-page-desktop"
import OverviewPageMobile from "./components/overview-mobile"


export default function OverviewPage() {
  return (
    <>
      <div className="hidden lg:block">
        <OverviewPageDesktop />
      </div>
      <div className="block lg:hidden">
        <OverviewPageMobile />
      </div>
    </>
  )
}
