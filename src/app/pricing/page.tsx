import QuoteBuilder from "@/components/QuoteBuilder";
import styles from "./page.module.css";

export default function PricingPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <span className={styles.brandLabel}>Bespoke Valuation</span>
                <h1 className={styles.title}>Pricing Calculator</h1>
            </header>
            <QuoteBuilder />
        </div>
    );
}
