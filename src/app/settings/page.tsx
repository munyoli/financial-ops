import GarmentTypeManager from "@/components/GarmentTypeManager";
import GlobalSettingsForm from "@/components/GlobalSettingsForm";
import styles from "./page.module.css";

export default function SettingsPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <span className={styles.brandLabel}>Configuration</span>
                <h1 className={styles.title}>Studio Settings</h1>
            </header>

            <div className={styles.section}>
                <GlobalSettingsForm />
            </div>

            <div className={styles.section}>
                <GarmentTypeManager />
            </div>
        </div>
    );
}
